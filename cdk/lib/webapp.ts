import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwInt from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as logs from "aws-cdk-lib/aws-logs";
import * as ecrassets from "aws-cdk-lib/aws-ecr-assets";

export class MySiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /******************************************************************************
    * Defines whether resources should be retained or destroyed on stack deletion.*
    *******************************************************************************/
    const policy = this.node.tryGetContext("removalPolicy") === "destroy" ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN;

    /****************************************************************************************
    * S3 bucket used to host the frontend static files.                                     *
    * Bucket is private, encrypted, and optionally auto-deleted depending on removal policy.*
    ****************************************************************************************/
    const siteBucket = new s3.Bucket(this, "FrontendBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: policy,
      autoDeleteObjects: policy === cdk.RemovalPolicy.DESTROY,
    });

    /*******************************************************
    * CloudFront origin pointing to the private S3 bucket  *
    *******************************************************/
    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(siteBucket);

    /*********************************************************************************
    * Backend Lambda function built from a Docker image.                             *
    * Uses the Dockerfile in backend/ and provides the handler from dist output.     *
    *********************************************************************************/
    const backendFn = new lambda.DockerImageFunction(this, "BackendFn", {
      code: lambda.DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../"),
        { 
          file: "backend/Dockerfile",
          platform: ecrassets.Platform.LINUX_AMD64, 
          cmd: ["dist/src/handler.handler"],
          exclude: [
            "cdk",
            "cdk.out",
            "frontend",
            "**/cdk.out",
            "**/.git",
          ],
        }
      ),
      architecture: lambda.Architecture.X86_64,
      logRetention: logs.RetentionDays.ONE_WEEK,
      timeout: cdk.Duration.seconds(5),
    });

    /************************************************************************
    * HTTP API Gateway (v2) that will route requests to the backend Lambda. *
    ************************************************************************/
    const api = new apigwv2.HttpApi(this, "HttpApi");

    /*********************************************************
    * API route that forwards all /api/* requests to Lambda. *
    *********************************************************/
    api.addRoutes({
      path: "/api/{proxy+}",
      methods: [apigwv2.HttpMethod.ANY],
      integration: new apigwInt.HttpLambdaIntegration("LambdaIntegration", backendFn),
    });

    /***************************************************************************************************
    * Extracts the API Gateway hostname from the full endpoint URL for use by CloudFront's HttpOrigin. *                             *
    ***************************************************************************************************/
    const apiDomain = cdk.Fn.select(2, cdk.Fn.split("/", api.apiEndpoint));

    /**********************************************
    * CloudFront distribution:                    *
    * - Serves SPA from S3                        *
    * - Proxies /api/* to HTTP API                *
    * - Enforces HTTPS                            *
    * - Provides SPA routing fallback for 403/404 *
    **********************************************/
    const distribution = new cloudfront.Distribution(this, "FrontendDistribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        "api/*": {
          origin: new origins.HttpOrigin(apiDomain),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        },
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: "/index.html" },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: "/index.html" },
      ],
    });

    /**********************************************************************
    * Uploads built frontend files to S3 and invalidates CloudFront cache *
    * so updates are available immediately.                               *
    **********************************************************************/
    new s3deploy.BucketDeployment(this, "DeployFrontend", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../../frontend/dist"))],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    /*********************************
    * Outputs CloudFront domain name *
    *********************************/
    this.exportValue(distribution.distributionDomainName, {
      name: "FrontendUrl"
    });

    /***************************
    * Outputs API endpoint URL *
    ***************************/
    this.exportValue(api.apiEndpoint, { 
      name: "ApiEndpoint"
    });
  }
}
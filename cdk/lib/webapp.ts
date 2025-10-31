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

    const siteBucket = new s3.Bucket(this, "FrontendBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(siteBucket);

    const backendFn = new lambda.DockerImageFunction(this, "BackendFn", {
      code: lambda.DockerImageCode.fromImageAsset(
        path.join(__dirname, "../../backend"),
        { 
          file: "Dockerfile",
          platform: ecrassets.Platform.LINUX_AMD64, 
          cmd: ["dist/handler.handler"],
          entrypoint: ["/lambda-entrypoint.sh"],
        }
      ),
      architecture: lambda.Architecture.X86_64,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    const api = new apigwv2.HttpApi(this, "HttpApi");

    api.addRoutes({
      path: "/api/{proxy+}",
      methods: [apigwv2.HttpMethod.ANY],
      integration: new apigwInt.HttpLambdaIntegration("LambdaIntegration", backendFn),
    });

    const apiDomain = cdk.Fn.select(2, cdk.Fn.split("/", api.apiEndpoint));

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

    new s3deploy.BucketDeployment(this, "DeployFrontend", {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../../frontend/dist"))],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    this.exportValue(distribution.distributionDomainName, {
      name: "FrontendUrl"
    });

    this.exportValue(api.apiEndpoint, { 
      name: "ApiEndpoint"
    });
  }
}
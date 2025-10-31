# Cloud Web Application (React + AWS)

### Tech Stack
* Frontend: React + TypeScript + Vite
* Backend: Node.js + Express (running in AWS Lambda as a Docker container)
* Infrastructure: AWS CDK (TypeScript)
* Services Used:
    *  S3 (static hosting)
    *  CloudFront (HTTPS)
    *  API Gateway
    *  Lambda
    *  ECR & Docker (for Lambda image)
 
### Deployment

Build and deploy with the following command:
```
npm run deploy
```

### Clean Up

Remove all AWS resources with the following command:
```
npm run destroy
```

# Cloud Web Application (React + AWS)

## Tech Stack
* Frontend: React + TypeScript + Vite
* Backend: Node.js + Express (running in AWS Lambda as a Docker container)
* Infrastructure: AWS CDK (TypeScript)
* Services Used:
    *  S3 (static hosting)
    *  CloudFront (HTTPS)
    *  API Gateway
    *  Lambda
    *  ECR & Docker (for Lambda image)
<br>

## Initial Setup

1. Install AWS CLI and log in to your AWS account
```
aws configure
```
&nbsp;&nbsp;&nbsp;&nbsp;Enter:
* AWS Access Key
* AWS Secret Key
* Default region (e.g., eu-north-1)
* Output format (json)
<br>

2. Install AWS CDK
```
npm install -g aws-cdk
```
<br>

3. Install Docker

&nbsp;&nbsp;&nbsp;&nbsp;Download Docker Desktop [HERE](https://www.docker.com/products/docker-desktop/)

<br>  

4. Bootsrap CDK (first-time only)

```
cd cdk
cdk bootstrap
```
&nbsp;&nbsp;&nbsp;&nbsp;This creates an S3 bucket and ECR repo used by CDK to store assets (Docker images, code packages, etc.)

<br>
  
5. Install project dependencies

```
npm install
```
<br>

## Deployment

&nbsp;&nbsp;&nbsp;&nbsp;Build and deploy with the following command:
```
npm run deploy
```
<br>

## Clean Up

&nbsp;&nbsp;&nbsp;&nbsp;Remove all AWS resources with the following command:
```
npm run destroy
```

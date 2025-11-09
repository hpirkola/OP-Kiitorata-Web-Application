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

## Requirements

- Node.js 20.x (LTS, AWS Lambda compatible)
- Docker (required for building the Lambda image)
- AWS CLI (configured with credentials for deployment)
- AWS CDK v2
<br>

## Initial Setup

### 1. Install AWS CLI

* Mac OS (Homebrew)
```
brew install awscli
```
* Windows
   * Download installer: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

* Linux
```
sudo apt-get update && sudo apt-get install awscli
```

Verify installation:
```
aws --version
```

### 2. Create an IAM User for Deployment

Create an AWS account and then follow these steps:
* Go to AWS Console → IAM
* Click Users → Create user
* Name it: cdk-deploy (or any name)
* Permissions:
   * ✅ Attach existing policies
* After creating, go to Security credentials
* Click Create access key
* Choose Command Line Interface (CLI)
* Download the .csv file or copy the keys

Now you have:
* AWS Access Key ID
* AWS Secret Access Key

### 3. Configure AWS locally

```
aws configure
```
&nbsp;&nbsp;&nbsp;&nbsp;Enter:
* AWS Access Key
* AWS Secret Key
* Default region: eu-north-1 (or any region you want to deploy in)
* Output format: json
<br>

### 4. Verify Authentication

```
aws sts get-caller-identity
```
If everything was set up correctly, you should see something like this:

```
{
    "UserId": "ABCDEFGHIJKLMNOPQRSTU",
    "Account": "1234567890",
    "Arn": "arn:aws:iam::12345678:user/<name>"
}
```

### 5. Install AWS CDK
```
npm install -g aws-cdk
```
<br>

### 6. Install Docker

Download Docker Desktop [HERE](https://www.docker.com/products/docker-desktop/)

<br>  

### 7. Bootstrap CDK (first-time only)

```
cd cdk
cdk bootstrap
```
This creates the CDK bootstrap stack which provides:
   * Storage for Lambda/Docker assets
   * Deployment IAM roles

<br>
  
### 8. Install project dependencies

```
npm install
```
<br>

## Deployment

Build and deploy with **one** of the following commands:
```
npm run deploy
```
Uses **RETAIN** as the removal policy  
  → The S3 bucket and data will **not** be deleted during `cdk destroy`.  
```
npm run deploy:destroy-mode
```
Uses **DESTROY** as the removal policy  
  → The S3 bucket will be **emptied and deleted automatically** during `cdk destroy`.
<br>

## Clean Up

Remove all AWS resources with the following command:
```
npm run destroy
```

## Non idealities / things to improve

* Using a proper logger instead of console.log
* Using more environment variables and having the possibility to change them
* Handling image caching and preloading
* Adding tests

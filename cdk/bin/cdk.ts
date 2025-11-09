#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MySiteStack } from '../lib/webapp';

/*****************************************************************************************************************
* Initializes the CDK app and deploys the MySiteStack.                                                           *
* The deployment environment (account/region) is taken from the CDK CLI configuration or defaults to eu-north-1. *
*****************************************************************************************************************/
const app = new cdk.App();
new MySiteStack(app, 'MySiteStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || "eu-north-1"},
});
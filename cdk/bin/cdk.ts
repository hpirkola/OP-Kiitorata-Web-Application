#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MySiteStack } from '../lib/webapp';

const app = new cdk.App();
new MySiteStack(app, 'MySiteStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || "eu-north-1"},
});
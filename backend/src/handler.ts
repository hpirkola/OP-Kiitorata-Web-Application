import serverlessExpress from "@vendia/serverless-express";
import  app from "./app";

/**************************************************
* AWS Lambda entrypoint using serverless-express. *
**************************************************/
export const handler = serverlessExpress({ app });
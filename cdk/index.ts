import { App, RemovalPolicy, Size, Stack, StackProps } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {
  LayerVersion,
  Runtime,
  Code,
  Architecture,
  Function,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { join } from "path";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

const LAMBDA_CODE_PATH = "/lambda.zip";
const LAMBDA_HANDLER_PATH = "source/index.fetch";

enum DynamoPolicies {
  Query = "dynamodb:Query",
  Scan = "dynamodb:Scan",
  GetItem = "dynamodb:GetItem",
  PutItem = "dynamodb:PutItem",
  UpdateItem = "dynamodb:UpdateItem",
  DeleteItem = "dynamodb:DeleteItem",
  BatchGetItem = "dynamodb:BatchGetItem",
  BatchWriteItem = "dynamodb:BatchWriteItem",
}

class CrmRecycling extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const BunLayer = LayerVersion.fromLayerVersionArn(
      this,
      "bun",
      "arn:aws:lambda:eu-west-2:889999233739:layer:bun:1"
    );

    const lambda = new Function(this, "CrmRecycling", {
      runtime: Runtime.PROVIDED_AL2,
      handler: LAMBDA_HANDLER_PATH,
      code: Code.fromAsset(join(".", LAMBDA_CODE_PATH)),
      ephemeralStorageSize: Size.mebibytes(512),
      memorySize: 128,
      architecture: Architecture.ARM_64,
      layers: [BunLayer],
      environment: {
        NODE_ENV: "prod",
        REGION: "eu-west-2",
      },
    });

    const table = this.createDynamoDbTable();

    lambda.role?.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [table.tableArn],
        actions: [
          DynamoPolicies.BatchGetItem,
          DynamoPolicies.BatchWriteItem,
          DynamoPolicies.DeleteItem,
          DynamoPolicies.GetItem,
          DynamoPolicies.PutItem,
          DynamoPolicies.Query,
          DynamoPolicies.Scan,
          DynamoPolicies.UpdateItem,
        ],
      })
    );

    // // S3 bucket for React app
    // const reactBucket = new s3.Bucket(this, "ReactAppBucket", {
    //   removalPolicy: cdk.RemovalPolicy.DESTROY, // only for demo purposes, use a different policy for production
    // });

    // // CloudFront distribution for React app
    // const cloudFrontDistribution = new cloudfront.CloudFrontWebDistribution(
    //   this,
    //   "CloudFrontDistribution",
    //   {
    //     originConfigs: [
    //       {
    //         s3OriginSource: {
    //           s3BucketSource: reactBucket,
    //         },
    //         behaviors: [{ isDefaultBehavior: true }],
    //       },
    //     ],
    //   }
    // );

    // Lambda function for backend logic
    // const backendLambda = new lambdaNodejs.NodejsFunction(
    //   this,
    //   "BackendLambda",
    //   {
    //     entry: "lambda/my-lambda-handler.ts",
    //     layers: [
    //       lambda.LayerVersion.fromLayerVersionArn(
    //         this,
    //         "BunLayer",
    //         "<YOUR_BUN_LAYER_ARN>"
    //       ),
    //     ],
    //   }
    // );

    // API Gateway
    // const api = new apigateway.RestApi(this, "MyApi", {
    //   deployOptions: {
    //     stageName: "prod",
    //   },
    // });

    // // Integration between API Gateway and Lambda
    // const lambdaIntegration = new apigateway.LambdaIntegration(backendLambda);
    // api.root.addMethod("GET", lambdaIntegration);

    // // Output the CloudFront distribution domain name
    // new cdk.CfnOutput(this, "CloudFrontURL", {
    //   value: cloudFrontDistribution.distributionDomainName,
    // });
  }

  private createDynamoDbTable() {
    const table = new Table(this, "CrmRecyclingDb", {
      tableName: "Recycling",
      partitionKey: { name: "pk", type: AttributeType.STRING },
      sortKey: { name: "sk", type: AttributeType.STRING },

      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    table.addLocalSecondaryIndex({
      indexName: "userIdIndex",
      sortKey: { name: "userId", type: AttributeType.STRING },
    });

    return table;
  }
}

const app = new App();
new CrmRecycling(app, "CrmRecyclingStack", {});

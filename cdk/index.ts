import "dotenv/config";

import {
  App,
  CfnOutput,
  RemovalPolicy,
  Size,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  LayerVersion,
  Runtime,
  Code,
  Architecture,
  Function,
  FunctionUrlAuthType,
} from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { join } from "path";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";

const LAMBDA_CODE_PATH = "/lambda.zip";
const LAMBDA_HANDLER_PATH = "source/index.fetch";

enum DynamoPolicies {
  Describe = "dynamodb:DescribeTable",
  Create = "dynamodb:CreateTable",
  Query = "dynamodb:Query",
  Scan = "dynamodb:Scan",
  GetItem = "dynamodb:GetItem",
  PutItem = "dynamodb:PutItem",
  UpdateItem = "dynamodb:UpdateItem",
  DeleteItem = "dynamodb:DeleteItem",
  BatchGetItem = "dynamodb:BatchGetItem",
  BatchWriteItem = "dynamodb:BatchWriteItem",
}

const {
  AWS_ACCOUNT = "",
  AWS_REGION = "eu-north-1",
  NODE_ENV = "prod",
} = process.env;

class CrmRecycling extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const BunLayer = LayerVersion.fromLayerVersionArn(
      this,
      "bun",
      `arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT}:layer:bun:1`
    );

    const lambda = new Function(this, "CrmRecycling", {
      runtime: Runtime.PROVIDED_AL2,
      handler: LAMBDA_HANDLER_PATH,
      code: Code.fromAsset(join(".", LAMBDA_CODE_PATH)),
      ephemeralStorageSize: Size.mebibytes(512),
      memorySize: 256,
      architecture: Architecture.ARM_64,
      layers: [BunLayer],
      environment: {
        NODE_ENV: NODE_ENV,
        REGION: AWS_REGION,
      },
    });

    const lambdaUrl = lambda.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, "LambdaUrlOutput", { value: lambdaUrl.url });

    const table = this.createDynamoDbTable();

    lambda.role?.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [table.tableArn],
        actions: [
          DynamoPolicies.Describe,
          DynamoPolicies.Create,
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

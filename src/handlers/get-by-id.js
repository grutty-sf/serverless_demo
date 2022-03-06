// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;
const AWS = require("aws-sdk");
// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

const sqs = new AWS.SQS();

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.getByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);
 
  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.id;
 
  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  let params = {
    TableName : tableName,
    Key: { id: id },
  };
 
  const response = {
    statusCode: 200,
    body: 22222222
  };
  console.log('response', response);

  const params2 = {
    MessageBody: JSON.stringify([{a:1}, {a:2}]),
    QueueUrl: process.env.STOCK_SQS_URL,
  };

  console.log('sqs send', params2);
  await sqs.sendMessage(params2).promise();
  console.log('sqs send ok', );

 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}

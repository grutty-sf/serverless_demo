const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();
const moment = require("moment");

const stockChangeTableName = 'ECOM_stock_change';
const stockHoldTableName = 'ECOM_stock_hold';

const sqs = new AWS.SQS();


exports.getByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  console.info('received:', event);
 
  const id = event.pathParameters.id;
 
  let b = await DB.query({
    TableName: stockHoldTableName,
    KeyConditionExpression: "#created_at > :pre10min",
    ExpressionAttributeNames: {
      "#created_at": "created_at",
    },
    ExpressionAttributeValues: {
      ":pre10min": moment().subtract(Number(id), "minutes").toISOString(),
    },
    ProjectionExpression: "stock_id,action_amount",
  }).promise();

  // await sqs.sendMessage(params).promise();
  console.log('stock hold', JSON.stringify(b.Items));
 
  return {
    statusCode: 200,
    body: JSON.stringify(b.Items)
  };;
}

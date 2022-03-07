const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const moment = require("moment");
const stockChangeTableName = 'ECOM_stock_change';
const stockHoldTableName = 'ECOM_stock_hold';

exports.getByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  console.info('received:', event);
 
  const id = event.pathParameters.id;
 
  const params = {
    MessageBody: JSON.stringify(
      [
        {
          action: "hold",
          ref: `checkout_id${id}`,
          obj: {
              stock_id: `stock_id${id}`,
              created_at: new Date().toISOString(),
              action: "change",
              action_amount: 123,
              reference: `checkout_id${id}`,
          }
        }
      ]
    ),
    QueueUrl: process.env.STOCK_SQS_URL,
  };

  let params2 = {
    TableName: stockChangeTableName,
    //  ScanIndexForward: false,
    FilterExpression: "created_at > :pre10min",
    ExpressionAttributeValues: {
      ":pre10min": moment().subtract(Number(id), "minutes").toISOString(),
    },
  };
  let c = await DB.scan(params2).promise()
  console.log(1111111111111, c);

  let b = await DB.query({
    TableName: stockChangeTableName,
    IndexName: "created_at-index",
    KeyConditionExpression: "#created_at > :pre10min",
    ExpressionAttributeNames: {
      "#created_at": "created_at",
    },
    ExpressionAttributeValues: {
      ":pre10min": moment().subtract(Number(id), "minutes").toISOString(),
    },
    ProjectionExpression: "stock_id,action_amount",
  }).promise();

  console.log('sqs send', params);
  await sqs.sendMessage(params).promise();
  console.log('sqs send ok', );
 
  return {
    statusCode: 200,
    body: JSON.stringify(b.Items)
  };
}

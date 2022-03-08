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
 
  let c = await DB.scan({
    TableName: stockHoldTableName,
    //  ScanIndexForward: false,
    FilterExpression: "#created_at > :pre10min",
    ExpressionAttributeNames: {
      "#created_at": "created_at",
    },
    ExpressionAttributeValues: {
      ":pre10min": moment().subtract(Number(id), "minutes").toISOString(), // todo
    },
    ProjectionExpression: "stock_id,action_amount",
  }).promise()

  let b = await DB.query({
    TableName: stockHoldTableName,
    IndexName: "reference-index",
    KeyConditionExpression: "#ref = :ref",
    ExpressionAttributeNames: {
      "#ref": "reference",
    },
    ExpressionAttributeValues: {
      ":ref": '123', // todo checkout id
    },
    ProjectionExpression: "stock_id,created_at",
  }).promise()

  /* Items: [
    {
      ref: 'checkout_id3313',
      stock_id: '3313',
      created_at: '2022-03-08T02:34:06.324Z',
      action_amount: 123
    },
    {
      ref: 'checkout_id1',
      stock_id: 'stock_id1',
      created_at: '2022-03-08T03:08:48.155Z',
      action_amount: 123
    }
  ] */

  /* let b = await DB.query({
    TableName: stockHoldTableName,
    IndexName: "created_at-index",
    KeyConditionExpression: "#created_at > :pre10min",
    ExpressionAttributeNames: {
      "#created_at": "created_at",
    },
    ExpressionAttributeValues: {
      ":pre10min": moment().subtract(Number(id), "minutes").toISOString(),
    },
    ProjectionExpression: "stock_id,action_amount",
  }).promise(); */
 
  return {
    statusCode: 200,
    body: JSON.stringify({
      a: c.Items,
      b: b.Items
    })
  };
}

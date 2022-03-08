const AWS = require("aws-sdk");
const sqs = new AWS.SQS();

const DB = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get id and name from the body of the request
    const body = JSON.parse(event.body)
    let id = body.id;

    const response = {
        statusCode: 200,
        body: JSON.stringify({id})
    };

    // 模拟stock
    await DB.put({
      TableName: 'ECOM_stock',
      Item: { 
        stock_id: `${id}`,
        amount: 99,
      }
    }).promise()
    
    let created_at = new Date().toISOString();
    
    await sqs.sendMessage({
      MessageBody: JSON.stringify({
        action: "hold",
        ref: id, // checkoutid
        obj: {
            stock_id: `${id}`,
            action_amount: 11,
            created_at,
        }
      }),
      QueueUrl: process.env.STOCK_SQS_URL,
    }).promise();

    await sqs.sendMessage({
      MessageBody: JSON.stringify({
        action: "sold",
        ref: `order_id${id}`, // orderid?
        obj: {
            stock_id: `${id}`,
            created_at,
            action_amount: 11,
        }
      }),
      QueueUrl: process.env.STOCK_SQS_URL,
    }).promise();

    console.log('sqs send ok', );

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
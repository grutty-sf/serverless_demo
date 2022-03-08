const AWS = require("aws-sdk");
const sqs = new AWS.SQS();

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
    
    await sqs.sendMessage({
      MessageBody: JSON.stringify({
        action: "hold",
        ref: `checkout_id${id}`,
        obj: {
            stock_id: `${id}`,
            created_at: new Date().toISOString(),
            action: "hold",
            action_amount: 11,
            reference: `checkout_id${id}`,
        }
      }),
      QueueUrl: process.env.STOCK_SQS_URL,
    }).promise();

    await sqs.sendMessage({
      MessageBody: JSON.stringify({
        action: "sold",
        ref: `order_id${id}`,
        obj: {
            stock_id: `${id}`,
            created_at: new Date().toISOString(),
            action: "sold",
            action_amount: 11,
            reference: `order_id${id}`,
        }
      }),
      QueueUrl: process.env.STOCK_SQS_URL,
    }).promise();

    console.log('sqs send ok', );

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
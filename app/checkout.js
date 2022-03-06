const AWS = require("./aws-config")();
const DB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    try {
         // Get id and name from the body of the request
    const body = JSON.parse(event.body)
    let id = body.id;

    const response = {
        statusCode: 200,
        body: JSON.stringify({id})
    };

    const params = {
        MessageBody: JSON.stringify(
          [
            {
              action: "hold",
              ref: `checkout_id${id}`,
              obj: {
                  stock_id: `stock_id${id}`,
                  created_at: new Date().toISOString(),
                  action: "hold",
                  action_amount: 123,
                  reference: `checkout_id${id}`,
                  stock_amount: 10,
              }
            }
          ]
        ),
        QueueUrl: process.env.STOCK_SQS_URL,
      };
    
      console.log('sqs send', params);
      await sqs.sendMessage(params).promise();
      console.log('sqs send ok', );

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(error),
      }
    }
 
}
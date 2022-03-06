const tableName = process.env.SAMPLE_TABLE;
const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();

const sqs = new AWS.SQS();


exports.getByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  console.info('received:', event);
 
  const id = event.pathParameters.id;
 
  const response = {
    statusCode: 200,
    body: id
  };
  console.log('response', response);

  const params = {
    MessageBody: JSON.stringify(
      [
        {
          stock_id: `stock_id${id}`,
          created_at: new Date().toISOString(),
          action: "hold",
          action_amount: 123,
          reference: `checkout_id${id}`,
        }
      ]
    ),
    QueueUrl: process.env.STOCK_SQS_URL,
  };

  console.log('sqs send', params);
  await sqs.sendMessage(params).promise();
  console.log('sqs send ok', );

 
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}

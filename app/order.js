'use strict';

const config = require('../conf/config.json')
const AWS = require('aws-sdk');
const sqs = new AWS.SQS();
const { v4: uuidv4 } = require('uuid');

module.exports.checkout = async (event, context, callback) => {
    console.log(event)
    let statusCode = 200
    let message

    if (!event.body) {
        return {
        statusCode: 400,
        body: JSON.stringify({
            message: 'No order body was found',
        }),
        };
    }

    const region = context.invokedFunctionArn.split(':')[3]
    const accountId = context.invokedFunctionArn.split(':')[4]
    const queueName = config['queueName']

    // 组装 SQS 服务的 URL
    const queueUrl = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`
    const orderId = uuidv4()

    try {
      	// 调用 SQS 服务
        await sqs.sendMessage({
            QueueUrl: queueUrl,
            MessageBody: event.body,
            MessageAttributes: {
                orderId: {
                    StringValue: orderId,
                    DataType: 'String',
                },
            },
        }).promise();

        message = 'Order message is placed in the Queue!';

  } catch (error) {
    console.log(error);
    message = error;
    statusCode = 500;
  }

  // 快速返回订单 ID
  return {
    statusCode,
    body: JSON.stringify({
      message, orderId,
    }),
  };
};
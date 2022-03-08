const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();

const stockChangeTableName = 'ECOM_stock_change';
const stockHoldTableName = 'ECOM_stock_hold';
const stockTableName = 'ECOM_stock';

exports.handler = async (event) => {
    console.log('sqs handler', event);

    for (const record of event.Records) {
      let body = JSON.parse(record.body)
      console.log(`sqs body ${JSON.stringify(body)}`);

      let item = { 
        stock_id: body.obj.stock_id,
        created_at: body.obj.created_at,
        reference: body.ref,
        action_amount: body.obj.action_amount
      }

      try {
        if(body.action == 'hold') {
          await DB.put({
            TableName: stockHoldTableName,
            Item: item
          }).promise()

        } else {
          item.action = body.action;

          let stock = await DB.get({
            TableName: stockTableName,
            Key: {
              stock_id: item.stock_id,
            },
          }).promise();

          console.log('stock', stock);
          if(stock?.item) {
            item.stock_amount = stock.item.amount;
          }

          await DB.put({
            TableName: stockChangeTableName,
            Item: item
          }).promise()
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
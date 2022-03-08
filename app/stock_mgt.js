const AWS = require("./aws-config")();
const DB = new AWS.DynamoDB.DocumentClient();

const stockChangeTableName = 'ECOM_stock_change';
const stockHoldTableName = 'ECOM_stock_hold';
const stockTableName = 'ECOM_stock';

exports.handler = async (event) => {
    console.log('sqs handler', event);

    for (const record of event.Records) {
      let body = JSON.parse(record.body)

      let item = { 
        stock_id: body.obj.stock_id,
        created_at: body.obj.created_at,
        reference: body.ref,
        action_amount: body.obj.action_amount
      }

      try {
        // if hold, work with ECOM_stock_hold table
        if(body.action == 'hold') {
          await DB.put({
            TableName: stockHoldTableName,
            Item: item
          }).promise()

        } else {
          // if other action, work with ECOM_stock_change table
          item.action = body.action;

          // means the stock amount after this action
          let stock = await DB.get({
            TableName: stockTableName,
            Key: {
              stock_id: item.stock_id,
            },
          }).promise();
          console.log('stock', stock);
          if(stock?.Item) {
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
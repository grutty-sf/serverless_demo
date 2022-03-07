const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();

const stockChangeTableName = 'ECOM_stock_change';
const stockHoldTableName = 'ECOM_stock_hold';

exports.handler = async (event) => {
    console.log('sqs handler', event);
    
    let stockHoldArr = [];
    let stockChangeArr = [];
    event.Records.forEach(record => {
      let body = JSON.parse(record.body)
      console.log(`sqs body ${JSON.stringify(body)}`);

      for (const item of body) {
        let i = { 
          stock_id: item.obj.stock_id,
          created_at: item.obj.created_at,
          ref: item.ref,
          action_amount: item.obj.action_amount
        }
        if(item.action == 'hold') {
          stockHoldArr.push({
            PutRequest: { Item: i },
          });
        } else {
          // TODO stock 还要stock_amount
          stockChangeArr.push({
            PutRequest: { Item: i },
          })
        }
      }

    });

    try {
      if(stockChangeArr.length > 0) {
        await DB.batchWrite({
          RequestItems: {
            [stockChangeTableName]: stockChangeArr
          },
        }).promise()
      }

      if(stockHoldArr.length > 0) {
        await DB.batchWrite({
          RequestItems: {
            [stockHoldTableName]: stockHoldArr
          },
        }).promise()
      }
    } catch (error) {
      console.log(error);
    }
  }
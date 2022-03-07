const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();

const tableName = process.env.STOCK_HOLD_TABLE;

exports.handler = async (event, context) => {
    console.log('sqs handler')
    event.Records.forEach(record => {
      let body = JSON.parse(record.body)
      console.log(`sqs body ${JSON.stringify(body)}`);

      let actionHold = [];
      let actionOther = [];

      for (const item of body) {
        if(item.action == 'hold') {
          actionHold.push({
            PutRequest: { Item: item },
          });
        } else {
          actionOther.push({
            PutRequest: { Item: item.obj },
          })
        }
      }

      try {
        if(actionOther.length > 0) {
          DB.batchWrite({
            RequestItems: {
              ECOM_stock_change: actionOther
            },
          }).promise()
        }

        console.log('hold', JSON.stringify(actionHold));
        if(actionHold.length > 0) {
          DB.batchWrite({
            RequestItems: {
              ECOM_stock_hold: actionHold
            },
          }).promise()
        }
      } catch (error) {
        console.log('123', error);
      }
    });
  }
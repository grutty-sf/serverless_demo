const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    console.log('sqs handler')
    event.Records.forEach(record => {
      let body = JSON.parse(record.body)
      console.log(`sqs body ${body}`);

      let actionHold = [];
      let actionOther = [];

      body.forEach(item => {
        if(item.action == 'hold') {
          actionHold.push({
            PutRequest: { Item: item },
          });
        } else {
          actionOther.push({
            PutRequest: { Item: item.obj },
          })
        }
      })
      console.log('stock data', JSON.stringify(actionHold), JSON.stringify(actionOther));
      try {
        console.log(db, JSON.stringify(DB));
        if(actionOther.length > 0) {
          await DB.batchWrite({
            RequestItems: {
              ECOM_stock_change: actionOther
            },
          }).promise()
        }

        if(actionHold.length > 0) {
          await DB.batchWrite({
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
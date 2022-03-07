const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
    console.log('sqs handler')
    event.Records.forEach(record => {
      let body = JSON.parse(record.body)
      console.log(`sqs body ${body}`);

      let itemsHold = [];
      let itemsSold = [];

      try {
        body.forEach(item => {
          if(item.action == 'hold') {
            itemsHold.push({
              PutRequest: { Item: item },
            });
          } else {
            itemsSold.push({
              PutRequest: { Item: item.obj },
            })
          }
        })

        if(itemsSold.length > 0) {
          DB.batchWrite({
            RequestItems: {
              ECOM_stock_change: itemsSold
            },
          })
        }

        if(itemsHold.length > 0) {
          DB.batchWrite({
            RequestItems: {
              ECOM_stock_hold: itemsHold
            },
          })
        }
      } catch (error) {
        console.log('123', error);
      }




    });
    return {};
  }
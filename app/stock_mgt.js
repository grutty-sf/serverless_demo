const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context) {
    console.log('sqs handler')
    event.Records.forEach(record => {
      let body = JSON.parse(record.body)
      console.log(`sqs body ${body}`);

      let itemsHold = [];
      let itemsSold = [];

      try {
        body.forEach(item => {
          let i = {
            PutRequest: { Item: item},
          }
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

        await DB.batchWrite({
          RequestItems: {
            ECOM_stock_change: itemsSold
          },
        }).promise();

        await DB.batchWrite({
          RequestItems: {
            ECOM_stock_hold: itemsHold
          },
        }).promise();
      } catch (error) {
        console.log(error);
      }




    });
    return {};
  }
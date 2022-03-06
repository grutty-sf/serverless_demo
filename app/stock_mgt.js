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
            itemsHold.push(i);
          } else {
            itemsSold.push(i)
          }
        })
      } catch (error) {
        console.log(error);
      }


      /* await DB.batchWrite({
        RequestItems: {
          ECOM_stock_change: batchWrite.map((h) => {
            return {
              PutRequest: {
                Item: h,
              },
            };
          }),
        },
      }).promise(); */

    });
    return {};
  }
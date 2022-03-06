const AWS = require("./aws-config")();
const DB = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context) {
    console.log('sqs handler')
    event.Records.forEach(record => {
      let body = JSON.parse(record.body)
      console.log(`sqs body ${body}`);

      let itemsHold = [];
      let itemsSold = [];

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
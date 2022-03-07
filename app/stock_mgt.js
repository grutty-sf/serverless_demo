const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();

const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();
const tableName = process.env.STOCK_HOLD_TABLE;

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
          DB.batchWrite({
            RequestItems: {
              ECOM_stock_change: actionOther
            },
          }).promise()
        }

        if(actionHold.length > 0) {
          DB.batchWrite({
            RequestItems: {
              [tableName]: actionHold
            },
          }).promise()

          /* docClient.put(
            {
              action: "hold",
              ref: `checkout_id${id}`,
              obj: {
                  stock_id: `stock_id${id}`,
                  created_at: new Date().toISOString(),
                  action: "hold",
                  action_amount: 123,
                  reference: `checkout_id${id}`,
                  stock_amount: 10,
              }
            }
          ).promise(); */
        }
      } catch (error) {
        console.log('123', error);
      }
    });
  }
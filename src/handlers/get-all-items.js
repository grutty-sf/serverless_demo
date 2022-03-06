const tableName = process.env.SAMPLE_TABLE;

const AWS = require("aws-sdk");
const DB = new AWS.DynamoDB.DocumentClient();

exports.getAllItemsHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }

    console.info('received:', event);

    var params = {
        TableName : tableName
    };
    const data = await docClient.scan(params).promise();
    const items = data.Items;

    await DB.query({
        TableName: 'ECOM_stock_change',
        IndexName: "reference-index",
        KeyConditionExpression: "#ref = :ref",
        ExpressionAttributeNames: {
          "#ref": "reference",
        },
        ExpressionAttributeValues: {
          ":ref": checkout.checkout_id,
        },
        ProjectionExpression: "stock_id,created_at",
      }).promise()

    const response = {
        statusCode: 200,
        body: JSON.stringify(items)
    };

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}

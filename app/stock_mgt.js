exports.handler = async function(event, context) {
    console.log('sqs handler')
    event.Records.forEach(record => {
      const { body } = record;
      console.log(`sqs body ${body}`);
    });
    return {};
  }
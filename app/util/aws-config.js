const AWS = require("aws-sdk");

module.exports = function(f) {
  if (f) {
    AWS.config.loadFromPath(f);
  }
  return AWS
};
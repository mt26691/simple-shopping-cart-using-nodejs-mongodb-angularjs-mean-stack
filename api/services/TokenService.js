/**
* @module      :: Token service
* @description	:: this service is used for creating radom token
*/
var uuid = require("node-uuid");

module.exports.generate = function() {
  return { value: uuid.v4(), issuedAt: new Date() };
}
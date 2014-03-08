var request = require('request'),
    xml2js  = require('xml2js');

var Helpers = {

  getResponseAsJSObject: function (requestUrl, callback) {
    request(requestUrl, function (reqErr, response, body) {
      if (reqErr || response.statusCode !== 200 || body === null) {
        callback(null, null);
      } else {
        try {
          var parser = new xml2js.Parser();
          parser.parseString(body, function (parseErr, result) {
            if (!parseErr) {
              callback(null, result);
            }
          });  
        } catch(err) { 
          callback(err, null); 
        }
      }
    });
  }

};

module.exports = Helpers;
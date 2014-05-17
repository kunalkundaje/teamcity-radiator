var request = require('request'),
    xml2js  = require('xml2js');

var Helpers = {

  getResponseAsJSObject: function (requestUrl, callback) {
    request(requestUrl, function (reqErr, response, body) {
      if (reqErr || response.statusCode !== 200 || body === null) {
        callback(null, null);
      } else {
        var parser = new xml2js.Parser();
        parser.parseString(body, function (parseErr, result) {
          if (!parseErr) {
            callback(null, result);
          } else {
            callback(parseErr, null);
          }
        });
      }
    });
  },

  parseTimestamp: function (timestamp) {
    var year   = timestamp.substr(0,  4),
        month  = timestamp.substr(4,  2),
        date   = timestamp.substr(6,  2),
        t      = timestamp.substr(8,  1),
        hour   = timestamp.substr(9,  2),
        min    = timestamp.substr(11, 2),
        sec    = timestamp.substr(13, 2),
        offset = timestamp.substr(15);

    var isoString  = year + '-' + month + '-' + date + t + hour + ':' + min + ':' + sec + offset,
        parsedDate = new Date(isoString);

    return parsedDate.toDateString() + ' ' + parsedDate.toLocaleTimeString();
  }

};

module.exports = Helpers;
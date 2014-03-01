var fs = require('fs');

var Config = {

  readConfig: function(projectKey, callback) {
    fs.readFile('conf/config.json', function (error, contents) {
      if (error) { throw error; }

      var config = JSON.parse(contents);
      callback(null, config[projectKey]);
    });
  }

};

module.exports = Config;
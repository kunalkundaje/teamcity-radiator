var fs = require('fs');

var Config = {

  readConfig: function (projectKey, callback) {
    fs.readFile('conf/config.json', function (err, contents) {
      try {
        
        if (err) { throw err; }

        var config        = JSON.parse(contents),
            projectConfig = config[projectKey];

        if (projectConfig) { 
          callback(null, projectConfig);
        } else {
          throw 'Config not provided for project: ' + projectKey;
        }

      } catch (error) {
        callback('Error reading config -- ' + error, null);
      }
    });
  }

};

module.exports = Config;
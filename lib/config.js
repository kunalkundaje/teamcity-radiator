var fs = require('fs');

var Config = {

  readProjectConfig: function (projectKey, callback) {
    fs.readFile('conf/config.json', function (err, contents) {
      try {
        
        if (err) { throw err; }

        var config        = JSON.parse(contents),
            projectConfig = config[projectKey];
            
        if (projectConfig) {
          // Project-level credentials take precedence over global credentials for API access
          projectConfig.credentials = (!projectConfig.credentials && config.global_credentials) 
            ? config.global_credentials
            : projectConfig.credentials;

          callback(null, projectConfig);

        } else {
          throw 'Config not provided for project ' + projectKey;
        }

      } catch (error) {
        callback('Error reading config: ' + error, null);
      }
    });
  }

};

module.exports = Config;
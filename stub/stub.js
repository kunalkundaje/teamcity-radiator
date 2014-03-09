var nock   = require('nock'),
    config = require('../lib/config');

var Stub = {

  start: function (projectKey) {
    nock.disableNetConnect();

    config.readProjectConfig(projectKey, function (err, data) {
      data.stages.forEach(function (stage) {
        nock(data.teamCityUrl)
          .persist()
          .get('/guestAuth/app/rest/builds/?locator=buildType:' + stage.buildTypeId + ',count:10,running:any,canceled:any')
            .replyWithFile(200, __dirname + '/responses/builds_' + stage.buildTypeId + '.xml');
      });

      var buildIds = [1, 2, 3, 4];
      buildIds.forEach(function (buildId) { 
        nock(data.teamCityUrl)
          .persist()
          .get('/guestAuth/app/rest/changes?locator=build:(id:' + buildId + ')')
            .replyWithFile(200, __dirname + '/responses/changes_build' + buildId + '.xml');
      });

      var changeIds = [1, 2, 3, 4, 5];
      changeIds.forEach(function (changeId) { 
        nock(data.teamCityUrl)
          .persist()
          .get('/guestAuth/app/rest/changes/id:' + changeId)
            .replyWithFile(200, __dirname + '/responses/change_' + changeId + '.xml');
      });
    });
  }  

};

module.exports = Stub;
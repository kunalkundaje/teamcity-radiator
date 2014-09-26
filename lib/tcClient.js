var async   = require('async')
    helpers = require('./helpers');

var TcClient = {

  apiPath: '/guestAuth/app/rest',

  fetchBuilds: function (data, callback) {
    async.map(data.stages, 
      function (stage, callback) {
        var requestUrl = data.teamCityUrl + TcClient.apiPath + '/builds/?locator=buildType:' + stage.buildTypeId + ',count:10,running:any,canceled:any';
        var options = { url: requestUrl }
        if (data.credentials) { options: auth = { user: data.credentials.user, pass: data.credentials.pass }}
        helpers.getResponseAsJSObject(options, function (err, result) {
          if (result && result.builds && result.builds.build) {
            callback(null, result.builds.build);
          } else {
            var errorMessage = 'Unable to fetch builds for stage "' + stage.label + '" (' + stage.buildTypeId + '). ' +
              'Check this URL to make sure the response looks okay: ' + requestUrl;
            callback(errorMessage, data);
          }
        });
      }, 
      function (error, builds) {
        if (error) {
          callback(error, data);
        } else {
          data.builds = builds;
          callback(null, data);
        }
      }
    );
  },

  createPipelines: function(data, callback) {
    var stages = data.stages,
        builds = data.builds;

    var firstStage       = stages.shift(),
        firstStageBuilds = builds.shift();

    var pipelines = firstStageBuilds.map(function (build) {
      var buildData   = build.$,
          buildStatus = buildData.running ? 'running' : buildData.status.toLowerCase();
      return { id:        buildData.id, 
               number:    buildData.number,
               status:    buildStatus,
               startTime: helpers.parseTimestamp(buildData.startDate),
               changes:   [],
               stages:    [ { label: firstStage.label, status: buildStatus }]
             };
    }, this);

    pipelines.forEach(function (pipeline) {
      builds.forEach(function (buildsInStage, index) {
        var stage = stages[index];
        for(var i = 0; i < buildsInStage.length; i++) {
          
          var buildData = buildsInStage[i].$;
          if(buildData.number === pipeline.number) {
            var status = buildData.running ? 'running' : buildData.status.toLowerCase();
            pipeline.stages.push({ label: stage.label, status: status });
            if(status !== 'success' && pipeline.status !== 'running') {
              pipeline.status = status;
            }
            break;
          }

        }
      }, this);

      var numRequiredStages = stages.length - stages.filter(function(stage) { return stage.optional }).length + 1;
      if (pipeline.stages.length !== numRequiredStages && pipeline.status === 'success') {
        pipeline.status = 'unknown';
      }

    }, this);

    data.pipelines = pipelines;
    delete data.builds;
    callback(null, data);
  },

  fetchChanges: function(data, callback) {
    async.each(data.pipelines, 
      function (pipeline, callback) {
        var requestUrl = data.teamCityUrl + TcClient.apiPath + '/changes?locator=build:(id:' + pipeline.id + ')';
        var options = { url: requestUrl }
        if (data.credentials) { options: auth = { user: data.credentials.user, pass: data.credentials.pass }}
        helpers.getResponseAsJSObject(options, function (err, result) {
          if(result.changes && result.changes.change) {
            var changes = result.changes.change;
            async.each(changes, 
              function (change, callback) {
                var changeId         = change.$.id,
                    changeRequestUrl = data.teamCityUrl + TcClient.apiPath + '/changes/id:' + changeId;

                helpers.getResponseAsJSObject(changeRequestUrl, function (err, result) {
                  if(result) {
                    pipeline.changes.push(result.change.comment.shift());
                  }
                  callback(null);
                });
              }, 
              function (err) {
                callback(null);
              }
            );
          } else {
            callback(null);
          }
        });
      }, 
      function (err) {
        callback(null, data);
      }
    );
  }

};

module.exports = TcClient;
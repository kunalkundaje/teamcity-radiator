var async   = require('async'),
    request = require('request'),
    xml2js  = require('xml2js');

var TcClient = {

  fetchBuilds: function(data, callback) {
    this.teamCityUrl = data.teamCityUrl;

    async.map(data.stages, TcClient._fetchBuildsForStage, function (error, builds) {
      data.builds = builds;
      callback(null, data);
    });
  },

  createPipelines: function(data, callback) {
    var stages = data.stages,
        builds = data.builds;

    var firstStage       = stages.shift(),
        firstStageBuilds = builds.shift();

    var pipelines = firstStageBuilds.map(function (build) {
      var buildData   = build.$,
          buildStatus = buildData.running ? 'running' : buildData.status.toLowerCase();
      return { id:      buildData.id, 
               number:  buildData.number,
               status:  buildStatus,
               changes: [],
               stages:  [ { label: firstStage.label, status: buildStatus }]
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
    }, this);

    data.pipelines = pipelines;
    delete data.builds;
    callback(null, data);
  },

  fetchChanges: function(data, callback) {
    this.teamCityUrl = data.teamCityUrl;

    async.each(data.pipelines, TcClient._fetchChangesForPipeline, function (err) {
      callback(null, data);
    });
  },

  _fetchBuildsForStage: function(stage, callback) {
    var requestUrl =  this.teamCityUrl + '/builds/?locator=buildType:' + stage.buildTypeId + ',count:10,running:any,canceled:any';
    TcClient._getJsonResponse(requestUrl, function (err, result) {
      callback(null, result.builds.build);
    });
  },

  _fetchChangesForPipeline: function(pipeline, callback) {
    var requestUrl = this.teamCityUrl + '/changes?locator=build:(id:' + pipeline.id + ')';
    TcClient._getJsonResponse(requestUrl, function (err, result) {
      if(result.changes && result.changes.change) {
        var changes = result.changes.change;
        async.each(changes, 
          function (change, callback) {
            var changeId         = change.$.id,
                changeRequestUrl = this.teamCityUrl + '/changes/id:' + changeId;

            TcClient._getJsonResponse(changeRequestUrl, function (err, result) {
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

  _getJsonResponse: function(requestUrl, callback) {
    request(requestUrl, function (reqErr, response, body) {
      var parser = new xml2js.Parser();
      try {
        parser.parseString(body, function (parseErr, result) {
          callback(null, result);
        });  
      } catch(e) { }
    });
  }
};

module.exports = TcClient;
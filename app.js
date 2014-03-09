var express  = require('express'),
    async    = require('async'),
    config   = require('./lib/config'),
    tcClient = require('./lib/tcClient'),
    stub     = require('./stub/stub'),
    app      = express(),
    port     = process.env.PORT || 3000;

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', { layout: false });
  app.use(express.json());
  app.use(express.methodOverride());
  app.use(express.urlencoded());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function() { 
  app.use(express.errorHandler()); 
});

app.listen(port);

app.get('/builds/:projectKey', function (request, response) {
  var projectKey = request.params['projectKey'],
      getProjectKey = function (callback) { callback(null, projectKey); };

  if (process.argv[2] === 'stub') {
    stub.start(projectKey);
  }

  async.waterfall([
      getProjectKey,
      config.readProjectConfig,
      tcClient.fetchBuilds,
      tcClient.createPipelines,
      tcClient.fetchChanges
    ],
    function (error, result) {
      if (error) {
        response.render('error', { error: error });
      } else {
        response.render('builds', { project: result.project, 
                                    builds:  result.pipelines });
      }
    }
  );
});
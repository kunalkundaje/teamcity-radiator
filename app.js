var express  = require('express'),
    async    = require('async'),
    config   = require('./lib/config'),
    tcClient = require('./lib/tcClient'),
    stub     = require('./stub/stub'),
    app      = express(),
    port     = process.env.PORT || 3000;

// Express configuration
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

// Express routes
app.get('/builds/:projectKey', function (request, response) {
  var projectKey = request.params['projectKey'];

  // If app is started in stub mode, use stub responses via nock instead of calling the TeamCity API
  if (process.argv[2] === 'stub') {
    stub.start(projectKey);
  }

  var getProjectKeyAsync = function (callback) { 
    callback(null, projectKey); 
  };

  async.waterfall([
      getProjectKeyAsync,
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

// Start up the server
var server = app.listen(port, function () {
  console.log('Listening on port %s', server.address().port);
});
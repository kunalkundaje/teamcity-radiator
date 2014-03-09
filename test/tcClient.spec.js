var tcClient = require('../lib/tcClient'), 
    nock     = require('nock'),
    expect   = require('chai').expect;

describe('TcClient', function () {

  beforeEach(function () {
    nock.disableNetConnect();
  });

  afterEach(function () {
    nock.cleanAll();
  });

  describe('#fetchBuilds', function () {

    it('fetches builds for a given stage', function (done) {
      var teamCityUrl = 'http://teamcity.mydomain.com:8111',
          stage       = { "label": "Step 1", "buildTypeId": "bt1000" };

      var serviceCall = nock(teamCityUrl)
        .get('/guestAuth/app/rest/builds/?locator=buildType:' + stage.buildTypeId + ',count:10,running:any,canceled:any')
        .replyWithFile(200, __dirname + '/../stub/responses/builds_bt1.xml');

      tcClient.fetchBuilds({ teamCityUrl: teamCityUrl, stages: [ stage ] }, function (err, data) {

        expect(serviceCall.isDone()).to.be.true;

        expect(data.teamCityUrl).to.not.be.null;
        expect(data.stages.length).to.eq(1);
        expect(data.builds.length).to.eq(1);
        expect(data.builds[0].length).to.eq(4);
        
        done();
      });
    });

  });

  describe('#fetchChanges', function () {

    it('fetches change comments for a given pipeline', function (done) {
      var teamCityUrl = 'http://teamcity.mydomain.com:8111',
          pipeline    = { "id": 1, changes: [] };

      var buildChangesServiceCall = nock(teamCityUrl)
        .get('/guestAuth/app/rest/changes?locator=build:(id:' + pipeline.id + ')')
        .replyWithFile(200, __dirname + '/../stub/responses/changes_build1.xml');
        
      var changeDetailsServiceCall = nock(teamCityUrl)
        .get('/guestAuth/app/rest/changes/id:1')
        .replyWithFile(200, __dirname + '/../stub/responses/change_1.xml');
        
      tcClient.fetchChanges({ teamCityUrl: teamCityUrl, pipelines: [ pipeline ] }, function (err, data) {

        expect(buildChangesServiceCall.isDone()).to.be.true;
        expect(changeDetailsServiceCall.isDone()).to.be.true;

        expect(data.teamCityUrl).to.not.be.null;
        expect(data.pipelines.length).to.eq(1);
        expect(data.pipelines[0].changes.length).to.eq(1);
        expect(data.pipelines[0].changes[0]).to.not.be.null;
        
        done();
      });
    });

  });

});
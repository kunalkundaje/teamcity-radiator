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
      var teamCityUrl = 'http://teamcity.mydomain.com:8111/teamcity/guestAuth/app/rest',
          stage       = { "label": "Step 1", "buildTypeId": "bt1" };

      var serviceCall = nock(teamCityUrl)
        .get('/teamcity/guestAuth/app/rest/builds/?locator=buildType:' + stage.buildTypeId + ',count:10,running:any,canceled:any')
        .reply(200, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><builds count="10" nextHref="/guestAuth/app/rest/builds/?locator=buildType:bt1,count:10,canceled:any,running:any"><build id="127362" number="5.7.1-46-g7408fc8" status="SUCCESS" buildTypeId="bt1" startDate="20140221T105606-0500" href="/guestAuth/app/rest/builds/id:127362" webUrl="http://teamcity.mydomain.com/teamcity/viewLog.html?buildId=127362&amp;buildTypeId=bt1"/><build id="127360" number="5.7.1-45-g4f8a5b7" status="SUCCESS" buildTypeId="bt1" startDate="20140221T105118-0500" href="/guestAuth/app/rest/builds/id:127360" webUrl="http://teamcity.mydomain.com/teamcity/viewLog.html?buildId=127360&amp;buildTypeId=bt1"/><build id="127277" number="5.7.1-44-g8920985" status="SUCCESS" buildTypeId="bt1" startDate="20140221T064147-0500" href="/guestAuth/app/rest/builds/id:127277" webUrl="http://teamcity.mydomain.com/teamcity/viewLog.html?buildId=127277&amp;buildTypeId=bt1"/></builds>');

      tcClient.fetchBuilds({ teamCityUrl: teamCityUrl, stages: [ stage ] }, function (err, data) {

        expect(serviceCall.isDone()).to.be.true;

        expect(data.teamCityUrl).to.not.be.null;
        expect(data.stages.length).to.eq(1);
        expect(data.builds.length).to.eq(1);
        expect(data.builds[0].length).to.eq(3);
        
        done();
      });
    });

  });

  describe('#fetchChanges', function () {

    it('fetches change comments for a given pipeline', function (done) {
      var teamCityUrl = 'http://teamcity.mydomain.com:8111/teamcity/guestAuth/app/rest',
          pipeline    = { "id": 12345, changes: [] };

      var buildChangesServiceCall = nock(teamCityUrl)
        .get('/teamcity/guestAuth/app/rest' + '/changes?locator=build:(id:' + pipeline.id + ')')
        .reply(200, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><changes count="1"><change id="126049" href="/guestAuth/app/rest/changes/id:126049" /></changes>');

      var changeDetailsServiceCall = nock(teamCityUrl)
        .get('/teamcity/guestAuth/app/rest' + '/changes/id:126049')
        .reply(200, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><change username="johndoe" date="20140221T105319-0500" id="126049"><comment>This is a change</comment></change>');

      tcClient.fetchChanges({ teamCityUrl: teamCityUrl, pipelines: [ pipeline ] }, function (err, data) {

        expect(buildChangesServiceCall.isDone()).to.be.true;
        expect(changeDetailsServiceCall.isDone()).to.be.true;

        expect(data.teamCityUrl).to.not.be.null;
        expect(data.pipelines.length).to.eq(1);
        expect(data.pipelines[0].changes.length).to.eq(1);
        expect(data.pipelines[0].changes[0]).to.eq('This is a change');
        
        done();
      });
    });

  });

});
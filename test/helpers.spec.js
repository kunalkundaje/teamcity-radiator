var helpers = require('../lib/helpers'), 
    nock     = require('nock'),
    expect   = require('chai').expect;

describe('Helpers', function () {

  describe('#getResponseAsJSObject', function () {

    beforeEach(function () {
      nock.disableNetConnect();
    });

    afterEach(function () {
      nock.cleanAll();
    });    

    it('returns a valid object for a valid response', function (done) {
      var requestUrl = 'http://server/endpoint';

      var serviceCall = nock('http://server')
        .get('/endpoint')
        .reply(200, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><change username="johndoe" date="20140221T105319-0500" id="126049"><comment>This is a change</comment></change>');

      helpers.getResponseAsJSObject(requestUrl, function (err, data) {

        expect(serviceCall.isDone()).to.be.true;

        expect(err).to.be.null;
        expect(data.change).to.not.be.null;
        expect(data.change.comment).to.not.be.null;
        
        done();
      });
    });

    it('returns a null response for a non-successful request', function (done) {
      var requestUrl = 'http://server/endpoint',
          serviceCall = nock('http://server').get('/endpoint').reply(404);

      helpers.getResponseAsJSObject(requestUrl, function (err, data) {

        expect(serviceCall.isDone()).to.be.true;

        expect(err).to.be.null;
        expect(data).to.be.null;
        
        done();
      });      
    });

    it('returns an error for a malformed response', function (done) {
      var requestUrl = 'http://server/endpoint',
          serviceCall = nock('http://server').get('/endpoint').reply(200, 'malformed xml');

      helpers.getResponseAsJSObject(requestUrl, function (err, data) {

        expect(serviceCall.isDone()).to.be.true;

        expect(err).to.not.be.null;
        expect(data).to.be.null;
        
        done();
      });      
    });

  });

  describe('#parseTimestamp', function () {

    it('parses a TeamCity API timestamp', function () {
      var tcTimestamp = '20140221T105606-0500';

      var parsedTimestamp = helpers.parseTimestamp(tcTimestamp);

      expect(parsedTimestamp).to.eq('Fri Feb 21 2014 10:56:06');
    });

  });

});
var config = require('../lib/config'), 
    expect = require('chai').expect;

describe('Config', function () {
  describe('#readProjectConfig', function () {

    it('returns a config object for a valid project key', function (done) {
      config.readProjectConfig('example_project', function (err, result) {
        
        expect(err).to.be.null;
        
        expect(result).to.not.be.null;
        expect(result.project).to.not.be.null;
        expect(result.teamCityUrl).to.not.be.null;
        expect(result.stages.length).to.eql(4);

        done();
      });
    });

    it('returns an error for an invalid project key', function (done) {
      config.readProjectConfig('invalid_key', function (err, result) {
        
        expect(err).to.not.be.null;
        expect(result).to.be.null;

        done();
      });
    });    

  });
});
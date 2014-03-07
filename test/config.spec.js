var config = require('../config.js'), 
    expect = require('chai').expect;

describe('Config', function () {
  describe('#readConfig', function () {

    it('exists as a method', function () {
      expect(typeof config.readConfig).to.eql('function');
    });

    it('returns a config object for a valid project key', function (done) {
      config.readConfig('project_master', function (err, result) {
        
        expect(err).to.be.null;
        
        expect(result).to.not.be.null;
        expect(result.project).to.not.be.null;
        expect(result.teamCityUrl).to.not.be.null;
        expect(result.stages.length).to.eql(4);

        done();
      });
    });

    it('returns an error for an invalid project key', function (done) {
      config.readConfig('invalid_key', function (err, result) {
        
        expect(err).to.not.be.null;
        expect(result).to.be.null;

        done();
      });
    });    

  });
});
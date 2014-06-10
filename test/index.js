var Logger = require('../');
var expect = require('chai').expect;
var winstonKibana = require('winston-kibana');

describe('logger', function () {

  it('should have a kibana rewriter', function () {
    var logger = new Logger({});
    expect(logger.rewriters[0]).to.not.be.undefined;
  });

  it('should be configured for a dev environnement', function() {
    var logger = new Logger({
      env: 'development',
      application: 'test'
    });

    expect(logger.transports.console).to.not.be.undefined;
    expect(logger.transports.memory).to.be.undefined;
  });

  it('should be configured for a test environment', function () {
    var logger = new Logger({
      env: 'test',
      application: 'test'
    });

    expect(logger.transports.console).to.be.undefined;
    expect(logger.transports.memory).to.not.be.undefined;
  });

  it('should be configured for a e2e environment', function () {
    var logger = new Logger({
      env: 'e2e',
      application: 'test'
    });

    expect(logger.transports.memory).to.not.be.undefined;
    expect(logger.transports.console).to.be.undefined;
  });

  it('should be configured for a prod environment', function () {
    var logger = new Logger({
      env: 'production',
      application: 'test',
      uncaughtExceptionsTo: 'test'
    });

    expect(logger.transports.memory).to.be.undefined;
    expect(logger.transports.console).to.not.be.undefined;
    expect(logger.exceptionHandlers.mail).to.not.be.undefined;

    expect(logger.exceptionHandlers.mail.server.smtp.host).to.eql('relai.lemonde.fr');
  });

  it('should expose a close function', function(done){
    var logger = new Logger({
      env: 'none',
      application: 'test'
    });

    logger.close(function() {
      done();
    });
  });
});

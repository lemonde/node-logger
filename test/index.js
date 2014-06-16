var Logger = require('../');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var winston = require('winston');
var winstonKibana = require('winston-kibana');
var winstonSyslog = require('winston-syslog');
var winstonError = require('winston-error');
var winstonElasticSearch = require('winston-elasticsearch');

var expect = chai.expect;
chai.use(sinonChai);

describe('logger', function () {
  var loggerStub, addStub, addRewriterStub,
      handleExceptionsStub, infoStub, logStub;
  beforeEach(function () {
    addStub = sinon.stub();
    addRewriterStub = sinon.stub();
    handleExceptionsStub = sinon.stub();
    logStub = sinon.stub();

    loggerStub = sinon.stub(winston, 'Logger');
    loggerStub.returns({
      add: addStub,
      addRewriter: addRewriterStub,
      handleExceptions: handleExceptionsStub,
      log: logStub
    });
  });

  afterEach(function () {
    winston.Logger.restore();
  });

  it('should have a kibana rewriter', function () {
    var logger = new Logger({
      application: 'test'
    });
    expect(addRewriterStub).to.have.been.calledWith(
      sinon.match(winstonKibana({application: 'test'})));
  });

  it('should be configured for a dev environnement', function() {
    var logger = new Logger({
      env: 'development',
      application: 'test'
    });

    expect(addStub).to.have.been.calledWith(winstonElasticSearch);
    expect(addStub).to.have.been.calledWith(winston.transports.Console);
  });

  it('should be configured for a test environment', function () {
    var logger = new Logger({
      env: 'test',
      application: 'test'
    });

    expect(addStub).to.have.been.calledWith(winston.transports.Memory);
    expect(addStub).to.not.have.been.calledWith(winston.transports.Console);
  });

  it('should be configured for a e2e environment', function () {
    var logger = new Logger({
      env: 'e2e',
      application: 'test'
    });

    expect(addStub).to.have.been.calledWith(winston.transports.Memory);
    expect(addStub).to.not.have.been.calledWith(winston.transports.Console);
  });

  it('should be configured for a prod environment', function () {
    var logger = new Logger({
      env: 'production',
      application: 'test',
      uncaughtExceptionsTo: 'test'
    });

    expect(handleExceptionsStub).to.have.been.called;
    expect(addStub).to.have.been.calledWith(winston.transports.Syslog);
    expect(addStub).to.have.been.calledWith(winston.transports.Console);
  });

  it('should default to a development environment', function () {
    var logger = new Logger({
      env: 'foobar',
      application: 'test',
      uncaughtExceptionsTo: 'test'
    });
  });

  it('should expose a log function', function () {
    var logger = new Logger({
      env: 'none',
      application: 'test'
    });

    logger.log('info', 'log');
    expect(logStub).to.have.been.calledWith('info', 'log');
  });

  it('should expose an level functions', function () {
    var logger = new Logger({
      env: 'none',
      application: 'test'
    });

    logger.info('log');
    logger.error('log');
    logger.warn('log');
    logger.debug('log');

    expect(logStub).to.have.been.calledWith('info', 'log');
    expect(logStub).to.have.been.calledWith('error', 'log');
    expect(logStub).to.have.been.calledWith('warn', 'log');
    expect(logStub).to.have.been.calledWith('debug', 'log');
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

  it('should add a metadata object to the log object', function () {
    var logger = new Logger({
      env: 'none',
      application: 'test-app'
    });

    logger.log('info', 'log', {foo: 'bar'});

    expect(logStub).to.have.been.calledWith('info', 'log',
                                            {'test-app': {foo: 'bar'}});
  });

});

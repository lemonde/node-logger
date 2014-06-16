'use strict';

var _ = require('lodash');
var winston = require('winston');
var winstonKibana = require('winston-kibana');
var winstonError = require('winston-error');

/**
 * Create a winston logger and set it up with various
 * logging mechanism based on the current environment.
 *
 * Return an object exposing logging functions
 *
 * @param {string} config.env either 'development', 'test', 'e2e' or 'production'
 * @param {string} config.application name of the logged application
 * @param {Object} config.winston a winston config object
 * @param {Object} config.syslog syslog configuration object
 * @param {string} config.uncaughtExceptionsTo email adress to send to when crash
 * in production env
 * @param {string} config.smtpHost smtp host to send to when crah in production
 * env
 * @return {Object} A logger
 */
module.exports = function (config) {

  /**
   * create the logger.
   */

  var logger = getWinstonLogger();

  /**
   * log a message
   *
   * @param {String} level log level (info, error, debug...)
   * @param {String} message log message
   * @param {Object} meta arbitraty metadata associated with the log
   */
  function log(level, message, meta) {
    var appMeta = {};
    appMeta[config.application] = meta;
    logger.log(level, message, appMeta);
  }

  /**
   * close the logger.
   */

  function close(cb) {
    if (logger.transports && logger.transports.Syslog)
      logger.transports.Syslog.close();

    if (_.isFunction(cb)) process.nextTick(cb);
  }

  /**
   * Return a winston logger setup for the current
   * environnement
   *
   * @return {winston.Logger}
   */
  function getWinstonLogger() {

    var logger = new winston.Logger();

    /**
     * rewriters.
     */

    logger.addRewriter(winstonKibana({application: config.application}));

    /**
     * helpers.
     */

    winstonError(logger);

    /**
     * configuration.
     */

    // development.
    if (config.env === 'development') {
      // add elastic search transport.
      logger.add(require('winston-elasticsearch'), config.winston);

      // add console transport.
      logger.add(winston.transports.Console, config.winston);
    }

    // tests.
    if (config.env === 'e2e' || config.env === 'test') {
      // add memory transport.
      logger.add(winston.transports.Memory, config.winston);
    }

    // production.
    if (config.env === 'production') {
      var Mailtransport = require('winston-mail').Mail;

      logger.add(winston.transports.Console, config.winston);
      logger.add(require('winston-syslog').Syslog, _.merge(
        {},
        config.winston,
        config.syslog
      ));

      logger.handleExceptions(new Mailtransport({
        to: config.uncaughtExceptionsTo,
        host: config.smtpHost
      }));

      logger.exitonerror = false;
    }

    return logger;
  }

  return {
    log: log,
    info: log.bind(null, 'info'),
    warn: log.bind(null, 'warn'),
    error: log.bind(null, 'error'),
    debug: log.bind(null, 'debug'),
    close: close
  };
};


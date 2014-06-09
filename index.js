'use strict';

var _ = require('lodash');
var winston = require('winston');
var winstonKibana = require('winston-kibana');
var winstonError = require('winston-error');

/**
 * @param config.env
 * @param config.application
 * @param config.winston
 * @param config.syslog
 * @param config.uncaughtExceptionsTo
 * @param config.smtpHost
 * @return logger
 */
module.exports = function (config) {

  /**
   * create the logger.
   */

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
   * close the logger.
   */

  logger.close = function (cb) {
    if (logger.transports && logger.transports.Syslog)
      logger.transports.Syslog.close();

    if (_.isFunction(cb)) process.nextTick(cb);
  };

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
};


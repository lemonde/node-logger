node-logger
===========

Logging lib for dev, test and prod environement.
Use winston to log.

##Environement
Logs vary based on environement.

###Development
- log to console
- log to elastic search
- log to kibana

###Test/e2e
- log to memory
- log to kibana

###Production
- log to console
- log to syslog
- send a mail in case of unhandled exception
- log to kibana

##Usage

```javascript

var Logger = require(‘node-logger’);


//instantiate and configure
var logger = new Logger({

  env: ‘development’,
  application: ‘myApp’,

  winston: {
    //winston config object, passed as-is to logger
  },

  syslog: {
    "host": "localhost",
    "port": 514,
    "protocol": "udp4",
    "facility": "local0",
    "localhost": "unconfigured",
    "app_name": "myApp"
  },

  uncaughtExceptionsTo: ‘my@mail.com’:
  smtpHost: ‘my.smtp.host’
});

//close all connections
logger.close(done);
```

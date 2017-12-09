const express = require('express');
const server = express();
const utils = require('./components/utils');

/**
 *   ___ ___ ___ _   _ ___ ___ _______   __
 *  / __| __/ __| | | | _ \_ _|_   _\ \ / /
 *  \__ \ _| (__| |_| |   /| |  | |  \ V /
 *  |___/___\___|\___/|_|_\___| |_|   |_|
 */

const helmet = require('helmet');
server.use(helmet());

const cors = require('cors');
allowedOrigins = utils.environment.getAllowedOrigins();

server.use(cors(allowedOrigins ?
  {
    origin: ((origin, callback) =>
      callback(null, (allowedOrigins.indexOf(origin) !== -1))
    ),
  } : undefined
));

/**
 *  _    ___   ___  ___ ___ _  _  ___
 * | |  / _ \ / __|/ __|_ _| \| |/ __|
 * | |_| (_) | (_ | (_ || || .` | (_ |
 * |____\___/ \___|\___|___|_|\_|\___|
 */

if (process.env.LOGS_DISABLED != 'true') {
  const morgan = require('morgan');

  server.use(morgan((tokens, req, res) => {
    const level = 'access';
    const {
      protocol,
      hostname,
    } = req;
    const status = tokens.status(req, res);
    const method = tokens.method(req, res);
    const url = tokens.url(req, res);
    const responseTime = tokens['response-time'](req, res);
    const remoteAddr = tokens['remote-addr'](req, res);
    const userAgent = tokens['user-agent'](req, res);
    const referrer = tokens['referrer'](req, res);
    const httpVersion = tokens['http-version'](req, res);
    const timestamp = (process.env.LOGS_TIMESTAMP == 'true') ?
      tokens.date(req, res, 'iso') : undefined;
    const contentLength = res.get('content-length');
    return ((process.env.LOGS_FORMAT == 'json') ?
      JSON.stringify({
        level,
        status,
        method,
        hostname,
        url,
        responseTime,
        remoteAddr,
        userAgent,
        referrer,
        timestamp,
      }, null, ((process.env.LOGS_STRINGIFY == 'true') ? 0 : 2))
      :
      `\
${timestamp ? `${timestamp} - : ` : ''}\
${status} | \
${protocol.toUpperCase()} ${httpVersion} ${method} ${url} | \
${hostname} | \
${referrer ? `${referrer}` : '-'} ${remoteAddr} | \
${contentLength ? `${contentLength}` : '-'} | \
${responseTime}ms | \
${userAgent}`
      );
  }));
}

module.exports = server;

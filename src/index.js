'use strict';

import Express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import passportJWT from 'passport-jwt';
import config from 'config';

let ExtractJwt = passportJWT.ExtractJwt;

let app = new Express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

// Authorization Middleware
app.use((req, res, next) => {
  let token = ExtractJwt.fromAuthHeaderWithScheme('JWT')(req) ||
              ExtractJwt.fromUrlQueryParameter('token')(req);

  if(!token) {
    const error = new Error('Authorization token is missing');
    error.status = 403;
    return next(error);
  }

  jwt.verify(token, config.auth.secret, (err, decoded) => {
    if(err) {
      const error = new Error('Authorization failed');
      error.status = 403;
      return next(error);
    }

    req.jwtData = decoded;
    req.token = token;

    return next();
  });
});

let Api = {
  reminders: require('./reminders')
};

app.use(Api.reminders);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: config.env === 'dev' ? err : {}
  });
});

if(config.env !== 'test') {
  app.listen(config.server.port, function() {
    console.log( `${config.meta.name.toUpperCase()} : Service is up !!`);
  });
}

process.on('unhandledRejection', function(reason, p) {
  console.log(reason.stack);
  setTimeout(() => process.exit(1), 100);
});

module.exports = app;

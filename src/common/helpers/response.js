'use strict';

import HttpStatus from 'http-status';

class Response {
  _send(res, status, data) {
    if( (typeof data === 'string') || (typeof data === 'number') || (data instanceof String)) {
      return res.sendStatus(status).send(data);
    }

    if(typeof data === 'object') {
      return res.sendStatus(status).json(data);
    }

    return res.sendStatus(status).send();
  }

  // 2xx Cases
  ok(res, data) {
    return this._send(res, HttpStatus.OK, data);
  }

  created(res, data) {
    return this._send(res, HttpStatus.CREATED, data);
  }

  accepted(res, data) {
    return this._send(res, HttpStatus.ACCEPTED, data);
  }

  noContent(res) {
    return this._send(res, HttpStatus.NO_CONTENT);
  }

  // 3xx Cases
  movedPermanently(res) {
    return this._send(res, HttpStatus.MOVED_PERMANENTLY);
  }

  found(res, data) {
    return this._send(res, HttpStatus.FOUND);
  }

  // 4xx Cases
  badRequest(res, error) {
    return this._send(res, HttpStatus.BAD_REQUEST, error);
  }

  unauthorized(res) {
    return this._send(res, HttpStatus.UNAUTHORIZED);
  }

  forbidden(res) {
    return this._send(res, HttpStatus.FORBIDDEN);
  }

  notFound(res) {
    return this._send(res, HttpStatus.NOT_FOUND);
  }

  methodNotAllowed(res) {
    return this._send(res, HttpStatus.METHOD_NOT_ALLOWED);
  }

  // 5xx Cases
  internalServerError(res, error) {
    return this._send(res, HttpStatus.INTERNAL_SERVER_ERROR, error);
  }

  badGateway(res, error) {
    return this._send(res, HttpStatus.BAD_GATEWAY);
  }

  serviceUnavailable(res, error) {
    return this._send(res, HttpStatus.SERVICE_UNAVAILABLE);
  }

  gatewayTimeout(res, error) {
    return this._send(res, HttpStatus.GATEWAY_TIMEOUT);
  }

  error(res, error) {
    if(error.badRequest) {
      delete error.badRequest;
      return this.badRequest(res, error);
    }

    if(error.internalServerError) {
      delete error.internalServerError;
      return this.internalServerError(res, error);
    }

    return this.internalServerError(res, error);
  }
}

export default new Response();

'use strict';

function HttpError(message, httpStatusCode, httpErrorMessage) {
  Error.call(this);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this);
  } else {
    this.stack = new Error().stack;
  }
  this.name = 'HttpError';
  this.message = message || "Internal Server Error";
  this.httpErrorMessage = httpErrorMessage || this.message;
  this.httpStatusCode = httpStatusCode || 500;
}

HttpError.prototype = Object.create(Error.prototype);
HttpError.prototype.constructor = Error;

module.exports = {
  httpError: function (message, httpStatusCode, httpErrorMessage) {
    throw new HttpError(message, httpStatusCode, httpErrorMessage);
  },
  http404: function (message, httpErrorMessage) {
    httpErrorMessage = httpErrorMessage || message || "Not Found";
    message = message || httpErrorMessage;
    throw new HttpError(message, 404, httpErrorMessage);
  },
  http500: function () {
    throw new HttpError(null, 500, null);
  }
};
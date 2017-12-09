#!/usr/bin/env node

'use strict';

const streamStream = require('stream-stream');
const byline = require('byline');
const {
  Transform
} = require('stream');

class AddLineEnds extends Transform {
  constructor(skipFirstLine) {
    super();
    this.skipFirstLine = skipFirstLine;
    this.didSkipFirstLine = false;
  }
  _transform(line, na, cb) {
    if (this.skipFirstLine && !this.didSkipFirstLine) {
      this.didSkipFirstLine = true;
      cb(null);
    } else {
      cb(null, line + '\n');
    }
  }
}

function defaultErrorHandler(err) {
  console.error(err.stack || err);
}

function appendStreams(streams, errorHandler) {
  errorHandler = errorHandler || defaultErrorHandler;
  var stst = streamStream();
  for (let i = 0, l = streams.length; i < l; i++) {
    streams[i].on('error', errorHandler);
    /*
      Split streams into lines so we can identify the first line.
    */
    streams[i] = byline.createStream(streams[i]);
    streams[i].on('error', errorHandler);
    const skipFirstLine = (i > 0);
    /*
      Add line ends back, and skip the first line of all but the first stream.
    */
    streams[i] = streams[i].pipe(new AddLineEnds(skipFirstLine));
    streams[i].on('error', errorHandler);
    stst.write(streams[i]);
  }
  stst.end();
  stst.on('error', errorHandler);
  return stst;
}

exports = module.exports = appendStreams;
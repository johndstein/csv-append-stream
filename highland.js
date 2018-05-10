#!/usr/bin/env node

'use strict';


const _ = require('highland');

const csv1 = [
  'name,address,phone\n',
  'joe,11 first st,9993330000\n',
  'bill,66 north st,1119995555'
];
const csv2 = [
  'name,address,phone\n',
  'harry,11 first st,9993330000\n',
  '# Comment right here in the middle\n',
  'larry,66 north st,1119995555\n',
  '\n        \n\n'
];
const csv3 = [
  'Junk Line\n',
  '# This is a comment\n'
];
const csv4 = [
  'Records not found for this query'
];
const csv5 = [
  '\n'
];
const csv6 = [
  ' '
];

const es = require('event-stream');

const s1 = es.readArray(csv1);
const s2 = es.readArray(csv2);
const s3 = es.readArray(csv3);
const s4 = es.readArray(csv4);
const s5 = es.readArray(csv5);
const s6 = es.readArray(csv6);

const byline = require('byline');

// _(s1).concat(['\n'])
//   .concat(s2).concat(['\n'])
//   .concat(s3).concat(['\n'])
//   .concat(s4).concat(['\n'])
//   .concat(s5).concat(['\n'])
//   .concat(s6).concat(['\n'])
//   .pipe(process.stdout);

// _(csv1).concat(['\n'])
//   .concat(csv2).concat(['\n'])
//   .concat(csv3).concat(['\n'])
//   .concat(csv4).concat(['\n'])
//   .concat(csv5).concat(['\n'])
//   .concat(csv6).concat(['\n'])
//   .pipe(process.stdout);

const {
  Transform
} = require('stream');

class JunkRemovr extends Transform {
  constructor(options) {
    super(options);
    this.junk = options.junk || [];
  }
  _transform(chunk, encoding, callback) {
    let isJunk = false;
    for (let i = 0, l = this.junk.length; i < l && !isJunk; i++) {
      if (this.junk[i].test(chunk.toString())) {
        isJunk = true;
      }
    }
    if (isJunk) {
      callback();
    } else {
      callback(null, chunk);
    }
  }
}

class HeaderRemovr extends Transform {
  constructor(options) {
    super(options);
  }
  _transform(chunk, encoding, callback) {
    if (chunk.toString().trim().length === 0) {
      callback();
    } else {
      if (this.header) {
        if (chunk.toString() === this.header) {
          return callback();
        }
      } else {
        this.header = chunk.toString();
      }
      callback(null, chunk);
    }
  }
}

const addLineEnds = new Transform({
  transform(chunk, encoding, callback) {
    if (chunk.toString().trim().length > 0) {
      callback(null, chunk + '\n');
    } else {
      callback();
    }
  }
});

byline(
  _(s3).concat(['\n'])
    .concat(s6).concat(['\n'])
    .concat(s2).concat(['\n'])
    .concat(s1).concat(['\n'])
    .concat(s4).concat(['\n'])
    .concat(s5).concat(['\n'])
    .toNodeStream())
  .pipe(new JunkRemovr({
    junk: [
      /.*Line.*/,
      /Records not found for this query/,
      /^#.*/
    ]
  }))
  .pipe(new HeaderRemovr())
  .pipe(addLineEnds)
  .pipe(process.stdout);

// _(byline(s1))
//   .concat(byline(s2))
//   .concat(byline(s3))
//   .concat(byline(s4))
//   .concat(byline(s5))
//   .concat(byline(s6))
//   .toNodeStream()
//   .pipe(addLineEnds)
//   .pipe(process.stdout);

//_([s1,s2,s3,s4,s5,s6]).pipe(process.stdout);

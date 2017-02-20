'use strict'

var test = require('tap').test

var checksumStream = require('..')
var crypto = require('crypto')

var CONTENT = 'foobarbazquux'
var SIZE = CONTENT.length
var DIGEST = crypto.createHash('sha1').update(CONTENT).digest('hex')

test('passes data through and emits a digest', function (t) {
  var stream = checksumStream()
  var buf = ''
  var digest
  stream.on('data', function (d) { buf += d })
  stream.on('error', function (e) { throw e })
  stream.on('digest', function (d) {
    digest = d
  })
  stream.on('end', function () {
    t.ok(true, 'stream finished successfully')
    t.equal(CONTENT, buf, 'data output correctly')
    t.equal(DIGEST, digest, 'digest emitted before end')
    t.end()
  })
  stream.write(CONTENT)
  stream.end()
})

test('succeeds if digest passed in matches data digest', function (t) {
  var stream = checksumStream({digest: DIGEST})
  stream.on('error', function (e) { throw e })
  stream.on('data', function () {})
  stream.on('end', function () {
    t.ok(true, 'stream finished successfully')
    t.end()
  })
  stream.write(CONTENT)
  stream.end()
})

test('accepts an hash algorithm configuration', function (t) {
  var digest = crypto.createHash('sha256').update(CONTENT).digest('hex')
  var stream = checksumStream({
    digest: digest,
    algorithm: 'sha256'
  })
  t.plan(2)
  stream.on('data', function (d) {})
  stream.on('error', function (e) { throw e })
  stream.on('digest', function (d) {
    t.equal(digest, d, 'emitted digest matches')
  })
  stream.on('end', function () {
    t.ok(true, 'stream finished successfully')
  })
  stream.write(CONTENT)
  stream.end()
})

test('errors if checksum fails', function (t) {
  var stream = checksumStream({
    digest: DIGEST
  })
  stream.on('error', function (e) {
    t.ok(e, 'error emitted')
    t.equal(e.code, 'EBADCHECKSUM', 'has correct error code')
    t.done()
  })
  stream.on('digest', function (d) {
    throw new Error('digest emitted: ', d)
  })
  stream.on('end', function () {
    throw new Error('end event emitted')
  })
  stream.write(CONTENT.slice(3))
  stream.end()
})

test('pipes data and succeeds if size is right', function (t) {
  var stream = checksumStream({size: SIZE})
  var buf = ''
  stream.on('data', function (d) { buf += d })
  stream.on('error', function (e) { throw e })
  stream.on('end', function () {
    t.equal(buf, CONTENT, 'content fully streamed by `end`.')
    t.end()
  })
  stream.write(CONTENT)
  stream.end()
})

test('errors if written size is bigger than expected', function (t) {
  var stream = checksumStream({size: SIZE})
  stream.on('data', function () {})
  stream.on('error', function (e) {
    t.ok(e, 'got an overflow error')
    t.equal(e.code, 'EBADSIZE', 'useful error code returned')
    t.equal(e.found, CONTENT.length + 9, 'found is full size of data')
    t.equal(e.expected, CONTENT.length, 'expected the length of CONTENTS')
    t.end()
  })
  stream.on('end', function () {
    throw new Error('end event should not be emitted on error')
  })
  stream.write(CONTENT + 'blablabla')
  stream.end()
})

test('errors if stream ends before reaching expected size', function (t) {
  var stream = checksumStream({size: SIZE})
  stream.on('data', function () {})
  stream.on('error', function (e) {
    t.ok(e, 'got a premature eof')
    t.equal(e.code, 'EBADSIZE', 'useful error code returned')
    t.equal(e.found, 3, 'found data of size 3')
    t.equal(e.expected, CONTENT.length, 'expected the length of CONTENTS')
    t.end()
  })
  stream.on('end', function () {
    throw new Error('end event should not be emitted on error')
  })
  stream.write(CONTENT.slice(0, 3))
  stream.end()
})

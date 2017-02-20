'use strict'

var crypto = require('crypto')
var Transform = require('stream').Transform

module.exports = checksumStream
function checksumStream (opts) {
  opts = opts || {}
  var hash = crypto.createHash(opts.algorithm || 'sha1')
  var streamSize = 0
  var stream = new Transform({
    transform: function (chunk, enc, cb) {
      streamSize += chunk.length
      hash.update(chunk, enc)
      cb(null, chunk, enc)
    },
    flush: function (cb) {
      var streamDigest = hash.digest('hex')
      if (typeof opts.size === 'number' && streamSize !== opts.size) {
        return cb(sizeError(opts.size, streamSize))
      } else if (opts.digest && streamDigest !== opts.digest) {
        return cb(checksumError(opts.digest, streamDigest))
      } else {
        stream.emit('size', streamSize)
        stream.emit('digest', streamDigest)
        return cb()
      }
    }
  })
  return stream
}

function sizeError (expected, found) {
  var err = new Error('stream data size mismatch')
  err.expected = expected
  err.found = found
  err.code = 'EBADSIZE'
  return err
}

function checksumError (expected, found) {
  var err = new Error('checksum failed')
  err.code = 'EBADCHECKSUM'
  err.expected = expected
  err.found = found
  return err
}

# checksum-stream [![npm version](https://img.shields.io/npm/v/checksum-stream.svg)](https://npm.im/checksum-stream) [![license](https://img.shields.io/npm/l/checksum-stream.svg)](https://npm.im/checksum-stream) [![Travis](https://img.shields.io/travis/zkat/checksum-stream.svg)](https://travis-ci.org/zkat/checksum-stream) [![AppVeyor](https://ci.appveyor.com/api/projects/status/github/zkat/checksum-stream?svg=true)](https://ci.appveyor.com/project/zkat/checksum-stream) [![Coverage Status](https://coveralls.io/repos/github/zkat/checksum-stream/badge.svg?branch=latest)](https://coveralls.io/github/zkat/checksum-stream?branch=latest)

[`checksum-stream`](https://npm.im/checksum-stream) is a passthrough stream that calculates the digest and size for data piped through it. Before closing, it will emit `digest` and `size` events with the final stream size.

It can also be configured to error if `digest` or `size` do not matched a passed-in value that is expected for either or both. `size` errors will always be emitted first.

## Install

`$ npm install --save checksum-stream`

## Example

### npm repo
```javascript
const checksumStream = require('checksum-stream')
const fs = require('fs')
const request = require('request')

let req = request.get('https://npm.im/checksum-stream')
req.on('response', function (res) {
  res.pipe(
    checksumStream({
      algorithm: 'sha256',
      digest: res.headers['etag'],
      size: res.headers['content-length']
    }).on('error', e => throw e)
  ).pipe(
    fs.createWriteStream('./checksum-stream.html')
  )
})
```

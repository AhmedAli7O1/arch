'use strict';

const request = require("request");
const { Writable } = require("stream");
const util = require("util");

const cli = require('cli');

function bytesToSize(bytes) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

class EchoStream extends Writable {
  constructor(onData, onEnd) {
    super();
    this.size = 0;
    this.data = [];
    this.onData = onData;
    this.onEnd = onEnd;
  }

  bytesToSize(bytes) {
    return bytes;
    var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes == 0) return "0 Byte";
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  }

  _write(chunk, enc, next) {
    this.data.push(chunk);
    this.size += chunk.byteLength;

    if (this.onData) {
      this.onData(chunk, this.bytesToSize(this.size));
    }

    next();
  }

  end() {
    const data = Buffer.concat(this.data);
    const size = data.byteLength;

    if (this.onEnd) {
      this.onEnd(data, this.bytesToSize(size));
    }
  }
}

function download(url) {
  return new Promise((resolve, reject) => {
    let totalSize = 0;

    const myStream = new EchoStream(onData, onEnd);

    const options = {
      method: 'GET',
      timeout: 10000,
      url
    };

    request(options)
      .on('response', res => {
        totalSize = res.headers["content-length"] || 0;
      })
      .on('error', (err) => reject(err))
      .pipe(myStream);

    function onData(data, size) {
      cli.progress(((size * (100 / totalSize)).toFixed(0) / 100)); 
    }

    function onEnd(data, size) {
      const downloadedSize =  bytesToSize(size);
      cli.ok(`Downloaded Size ${downloadedSize}`);

      resolve(data);
    }
  });
}

module.exports = download;

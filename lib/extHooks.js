"use strict";


async function loaderError (errObj) {
  return errObj;
}

async function generalError (errObj) {
  return errObj;
}

async function before () {
  // console.log("in before");
}

async function after () {
  // console.log("in after");
}


module.exports = {
  loaderError,
  generalError,
  before,
  after
};
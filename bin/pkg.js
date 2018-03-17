#!/usr/bin/env node

'use strict';

const NodeArch = require('../lib/nodearch');
const cli = require('cli');
const inquirer = require('inquirer');
const _ = require('lodash');
const packageManager = require('../lib/pkg');

const nodearch = new NodeArch(true);

async function exec() {

  nodearch.log.info(`Node.js Server/Architecture Manager v${nodearch.pkgInfo.version}`);
  nodearch.log.info(`Package Installer for NodeArch Extensions`);
  // nodearch.log.info(`Environment >> ${nodearch.ENV}`);
  // nodearch.log.info('Started In', nodearch.paths.app);
  // nodearch.log.info(`Started At >> ${Date()}`);

  await nodearch.init();

  cli.parse(
    {
      file: ['f', 'A file to process', 'file', 'asdasd'],           // -f, --file FILE   A file to process 
      time: ['t', 'An access time', 'time', false],                 // -t, --time TIME   An access time 
      work: [false, 'What kind of work to do', 'string', 'sleep']   //     --work STRING What kind of work to do 
    },
    {
      install: 'install nodearch extension'
    }
  );

  switch (cli.command) {
    case 'install':
      await install(cli.args);
      break;
  }

  async function pkgsToInstall (requestedPkgs = []) {
    const pkgsInfo = await packageManager.pkgsInfo();

    requestedPkgs = _.map(requestedPkgs, requestedPkg => {
      const parts = requestedPkg.split('@');
      return {
        name: parts[0],
        requestedTag: packageManager.resolveVersion(parts[1])
      };
    });

    const notFoundPkgs = _.difference(_.map(requestedPkgs, 'name'), _.map(pkgsInfo, 'name'));

    if (!_.isEmpty(notFoundPkgs)) {
      throw new Error(`the following packages were not found... ${notFoundPkgs}`);
    }

    if (_.isEmpty(requestedPkgs)) {
      const answers = await inquirer.prompt([{
        type: 'checkbox',
        name: 'pkgs',
        message: `choose from the available packages`,
        pageSize: 5,
        choices: _.map(pkgsInfo, 'name')
      }]);
      requestedPkgs = _.map(answers.pkgs, x => ({ name: x }));
    }

    if (_.isEmpty(requestedPkgs)) {
      throw new Error('no packages to install');
    }

    requestedPkgs = _.map(requestedPkgs, requestedPkg => {
      const pkgInfo = _.find(pkgsInfo, { name: requestedPkg.name })
      return {
        name: requestedPkg.name,
        requestedTag: requestedPkg.requestedTag,
        tags: _.get(pkgInfo, 'tags')
      };
    });

    return requestedPkgs || [];

  } 

  async function resolveTags (requestedPkgs) {
    for (const requestedPkg of requestedPkgs) {

      if (requestedPkg.requestedTag && !_.find(requestedPkg.tags, { version: requestedPkg.requestedTag })) {
        nodearch.log.warn(`package ${requestedPkg.name} with the tag ${requestedPkg.tag} does not exist!`);
        requestedPkg.requestedTag = null;
      }

      if (!requestedPkg.requestedTag) {
        const answers = await inquirer.prompt([{
          type: 'list',
          name: 'tags',
          message: `choose from the available tags for the package ${requestedPkg.name}`,
          pageSize: 5,
          choices: _.map(requestedPkg.tags, 'version')
        }]);
        requestedPkg.requestedTag = answers.tags;
      }

    }
    return requestedPkgs || [];
  }

  async function install(requestedPkgs = []) {

    nodearch.log.info(`fetching packages info...`);

    requestedPkgs = await pkgsToInstall(requestedPkgs);

    requestedPkgs = await resolveTags(requestedPkgs);

    for (const requestedPkg of requestedPkgs) {

      nodearch.log.info(`installing package ${requestedPkg.name}...`);
      await packageManager.install(requestedPkg, nodearch.paths.extensions, nodearch.paths.pkgTemp);

    }

    return;

    for (const pk of requestedPkgs) {
      const parts = pk.split('@');

      const pkgName = parts[0];
      let pkgVersion = parts[1];

      nodearch.log.info(`fetching package ${pkgName} info...`);

      let pkgInfo;

      try {
        pkgInfo = await packageManager.fetchInfo(pkgName);
      }
      catch (e) {
        throw new Error(`cannot resolve package ${pkgName}`);
      }

      // TODO: handle pkage not found

      nodearch.log.info(
        `
          Name: ${pkgInfo.name}
          Latest Version: ${pkgInfo.version}
          Description: ${pkgInfo.description || 'N/A'}
          `
      );

      const pkgVersions = _.get(pkgInfo, 'nodearch.versions');



      if (!pkgVersion && !_.isEmpty(pkgVersions)) {

        const answers = await inquirer.prompt([{
          type: 'list',
          name: 'version',
          message: `choose version of ${pkgName}`,
          pageSize: 5,
          choices: _.map(pkgVersions, 'num')
        }]);

        pkgVersion = answers.version;

      }
      else if (!pkgVersion && _.isEmpty(pkgVersions)) {
        nodearch.log.error('this package doesn\'t contains versions information, therefore, you should specify the version number!');
      }

      if (pkgVersion) {
        await packageManager.install({ pkgName, version: pkgVersion, saveLocation: nodearch.paths.extensions });
      }

    }
  }

}

exec()
  .then()
  .catch(err => {
    nodearch.log.error(err.message);
    console.log(err.stack);
  });

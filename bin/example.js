'use strict';

const inquirer = require('inquirer');
const _ = require('lodash');
const exampleManager = require('../lib/example');
const path = require('path');
const compare = require('../utils/compare');

let nodearch;

async function exampleToInstall () {
  const examplesInfo = await exampleManager.examplesInfo();

  const { selectedExampleName } = await inquirer.prompt([{
    type: 'list',
    name: 'selectedExampleName',
    message: `choose from the available examples`,
    pageSize: 5,
    choices: _.map(examplesInfo, 'name')
  }]);

  const selectedExample = _.find(examplesInfo, { name: selectedExampleName });

  const availableTags = selectedExample.tags || [];

  if (_.isEmpty(availableTags)) {
    throw new Error(`the example ${selectedExample.name} does not have any available tags to download!`);
  }

  if (availableTags.length === 1) {
    selectedExample.selectedTag = availableTags[0];    
  }

  if (!selectedExample.selectedTag) {
    const { selectedTagVersion } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedTagVersion',
      message: `choose from the available tags for the example ${selectedExample.name}`,
      pageSize: 5,
      choices:  _.map(availableTags, 'version').sort(compare.semver).reverse()
    }]);
    selectedExample.selectedTag = _.find(availableTags, { version: selectedTagVersion });
  }

  return selectedExample;

}

async function getExampleInfo (args) {

  let done = false;
  const dirContent = await nodearch.fs.dirContent(process.cwd());

  const exampleInfo = {
    name: args[0]
  };

  if (_.includes(dirContent.folders, exampleInfo.name)) {
    nodearch.log.error(`directory with the name ${exampleInfo.name} is already exist`);
    exampleInfo.name = null;
  }

  while(!exampleInfo.name) {
    nodearch.log.info('please enter your project name');

    const { projectName } = await inquirer.prompt([{
      type: 'input',
      name: 'projectName',
      message: `project name`,
      default: 'test-project'
    }]);

    if (_.includes(dirContent.folders, projectName)) {
      nodearch.log.error(`directory with the name ${projectName} is already exist`);
    }
    else {
      exampleInfo.name = projectName;  
    }
  }

  return exampleInfo;
}

async function generate (args) {

  nodearch.log.info('retrieving examples info');

  const selectedExample = await exampleToInstall();

  const exampleInfo = await getExampleInfo(args);

  const projectLocation = path.resolve(process.cwd(), exampleInfo.name);
  
  nodearch.log.info(`downloading project content for your ${selectedExample.name} server`);

  await exampleManager.download({
    pkgName: selectedExample.path,
    version: selectedExample.selectedTag.version,
    location: projectLocation
  });

  nodearch.log.info('running `npm install` for you, if something goes wrong try to run it yourself!');

  await exampleManager.installDeps(projectLocation);

  nodearch.log.info(
    `done, now you can run: 
    cd ${exampleInfo.name} && npm start`
  );
  
}

module.exports = function (nodearchObj) {
  nodearch = nodearchObj;
  return {
    generate
  };
};

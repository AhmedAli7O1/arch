'use strict';

const inquirer = require('inquirer');
const _ = require('lodash');
const exampleManager = require('../lib/example');
const path = require('path');

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
      choices: _.map(availableTags, 'version')
    }]);
    selectedExample.selectedTag = _.find(availableTags, { version: selectedTagVersion });
  }

  return selectedExample;

}

async function getExampleInfo (args) {

  const exampleInfo = {
    name: args[0]
  };

  if (!exampleInfo.name) {
    const { projectName } = await inquirer.prompt([{
      type: 'input',
      name: 'projectName',
      message: `project name`,
      default: 'test-project'
    }]);

    exampleInfo.name = projectName;
  }

  return exampleInfo;
}

async function generate (args) {

  nodearch.log.info('retrieving examples info');

  const selectedExample = await exampleToInstall();

  const exampleInfo = await getExampleInfo(args);

  const projectLocation = path.resolve(process.cwd(), exampleInfo.name);
  
  nodearch.log.info(`downloading example for ${selectedExample.name}`);

  await exampleManager.download({
    pkgName: selectedExample.path,
    version: selectedExample.selectedTag.version,
    location: projectLocation
  });

  nodearch.log.info('running `npm install` for you, if something goes wrong try to run it yourself!');

  await exampleManager.installDeps(projectLocation);
}

module.exports = function (nodearchObj) {
  nodearch = nodearchObj;
  return {
    generate
  };
};

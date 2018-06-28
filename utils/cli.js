'use strict';

const inquirer = require('inquirer');

async function checkbox ({ message, list, name = 'default' }) {
  const answers = await inquirer.prompt([{
    type: 'checkbox',
    name: name,
    message: message,
    pageSize: 5,
    choices: list
  }]);
  return answers[name];
}

async function list ({ message, list, name = 'default' }) {
  const answers = await inquirer.prompt([{
    type: 'list',
    name: name,
    message: message,
    pageSize: 5,
    choices: list
  }]);
  return answers[name];
}

module.exports = {
  checkbox,
  list
};

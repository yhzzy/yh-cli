#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const inquirer = require('inquirer')

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Project name?',
    default: __dirname,
  },
  {
    type: 'confirm',
    name: 'confirm',
    message: 'confirm name?',
  },
]

inquirer.prompt(questions)
.then(answers => {
  console.log(answers);
})

const { name, version } = require('../../package.json')
const commonQuestions = [
  {
    type: 'input',
    name: 'name',
    message: 'Project name?',
    default: process.cwd().split('/').pop(),
  },
  {
    type: 'input',
    name: 'version',
    message: 'Project version?',
    default: '0.1.0',
  },
  {
    type: 'input',
    name: 'author',
    message: 'Who is the author?',
  },
  {
    type: 'input',
    name: 'description',
    message: 'Project description?',
    default: 'this is a template',
  },
  {
    type: 'confirm',
    name: 'private',
    message: 'Is private?',
    default: false,
  },
  {
    type: 'list',
    name: 'license',
    message: 'please choice a license',
    choices: ['MIT', 'ISC', 'Apache'],
  },
]
const questions = {
  'template-vue-cli': [
    ...commonQuestions,
    {
      type: 'input',
      name: 'displayName',
      message: 'Display for webpack title name?',
      default: process.cwd().split('/').pop(),
    },
  ],
  'template-nm-cli': [
    ...commonQuestions,
  ],
}

module.exports = {
  name,
  version,
  questions,
}

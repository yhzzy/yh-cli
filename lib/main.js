const path = require('path')
const fs = require('fs')
const { program } = require('commander')

const { version } = require('./utils/constants')

const actions = {
  create: {
    description: 'create a project',
    alias: 'cr',
    examples: [
      'yh-cli create <template-name>'
    ],
  },
}

Object.keys(actions).forEach(action => {
  program
    .command(action)
    .description(actions[action].description)
    .alias(actions[action].alias)
    .action(() => {
      require(path.resolve(__dirname, action))(...process.argv.slice(3))
    })
})

program.on('--help', () => {
  console.log('Examples')
  Object.keys(actions).forEach(action => {
    (actions[action].examples || []).forEach(ex => {
      console.log(`${ex}`)
    })
  })
})

program.version(version)
  .parse(process.argv)

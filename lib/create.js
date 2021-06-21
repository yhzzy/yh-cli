const path = require('path')
const fs = require('fs')
const del = require('del')
const axios = require('axios')
const inquirer = require('inquirer')
const ora = require('ora')
const ejs = require('ejs')
const { promisify } = require('util')
const downLoadGitRepo = require('download-git-repo')
downLoadGit = promisify(downLoadGitRepo)

let repos = []

const loading  = (fn, msg) => async (...args) => {
  const spinner = ora(msg)
  spinner.start()
  const res = await fn(...args)
  spinner.succeed()
  return res
}

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Project name?',
    default: __dirname,
  },
  {
    type: 'input',
    name: 'displayName',
    message: 'Display for webpack title name?',
    default: __dirname,
  },
  {
    type: 'input',
    name: 'author',
    message: 'Who is the author?',
  },
  {
    type: 'confirm',
    name: 'private',
    message: 'Is private?',
  },
]

// 获取仓库地址
const fetchRepoList = async () => {
  const { data } = await axios.get('https://api.github.com/users/yhzzy/repos')
  return data
}

// 获取版本信息
const fetchTagList = async (repo) => {
  const { data } = await axios.get(`https://api.github.com/repos/yh-cli/${repo}/tags`)
  return data
};
const downloadPath = path.join(__dirname, 'template')

const download = async (path, repo) => {
  const repoPath = `yhzzy/${repo}`
  await downLoadGit(repoPath, path)
}

module.exports = async (projectName) => {
  repos = await loading(fetchRepoList, 'fetching repo list')()
  repos = repos.filter(item => item.name.split('-')[0] === 'template')
  inquirer.prompt([
    {
      type: 'list',
      name: 'templateType',
      message: 'please choice a template to create project',
      choices: repos,
    },
    ...questions,
  ])
  .then(async (answers) => {
    // const tmplDir = path.join(__dirname, 'templates')
    // const destDir = process.cwd()
    if (fs.existsSync(downloadPath)) {
      del(downloadPath)
      await loading(download, 'download the template now...')(downloadPath, answers.templateType)
    } else {
      await loading(download, 'download the template now...')(downloadPath, answers.templateType)
    }
    fs.readdir(downloadPath, (err, files) => {
      if (err) throw err
      files.forEach(file => {
        ejs.renderFile(path.join(downloadPath, file), answers)
      })
    })
  })
  // const { templateType } = await inquirer.prompt({
  //   type: 'list',
  //   name: 'templateType',
  //   message: 'please choice a template to create project',
  //   choices: repos,
  // })
  // if (fs.existsSync(downloadPath)) {
  //   del(downloadPath)
  //   await loading(download, 'download the template now...')(downloadPath, templateType)
  // } else {
  //   await loading(download, 'download the template now...')(downloadPath, templateType)
  // }
}

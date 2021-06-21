const path = require('path')
const fs = require('fs')
const del = require('del')
const axios = require('axios')
const inquirer = require('inquirer')
const ora = require('ora')
const ejs = require('ejs')
const { promisify } = require('util')
const downLoadGitRepo = require('download-git-repo')
const downLoadGit = promisify(downLoadGitRepo)

let repos = []

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

const templatePath = path.resolve(__dirname, '../templates')

// 获取仓库地址
const fetchRepoList = async () => {
  const { data } = await axios.get('https://api.github.com/users/yhzzy/repos')
  return data
}
// 获取最新版本信息
const fetchReleasesLatest = async (repo) => {
  const { data } = await axios.get(`https://api.github.com/repos/yhzzy/${repo}/releases/latest`)
  return data
};

const loading  = (fn, msg) => async (...args) => {
  const spinner = ora(msg)
  spinner.start()
  const res = await fn(...args)
  spinner.succeed()
  return res
}

const download = async (path, repo) => {
  const repoPath = `yhzzy/${repo}`
  await downLoadGit(repoPath, path)
}

const getTemplateVersion = dir => {
  const packageJson = fs.readFileSync(path.join(dir, 'package.json'))
  return JSON.parse(packageJson)
}

const writeTemplateFile = (tempDir, destDir, answers, file) => {
  ejs.renderFile(path.join(tempDir, file), answers, (err, result) => {
    if (err) throw err
    fs.writeFileSync(path.join(destDir, file), result)
  })
}

const isDirectory = dir => {
  try{
    return fs.statSync(dir).isDirectory()
  } catch(e) {
    return false
  }
}

const writeTemplateFiles = async (tempDir, destDir, answers) => {
  fs.readdir(tempDir, (err, files) => {
    if (err) throw err
    files.forEach(async (file) => {
      const isDir = isDirectory(path.join(tempDir, file))
      if (isDir) {
        fs.mkdirSync(path.join(destDir, file))
        writeTemplateFiles(path.join(tempDir, file), path.join(destDir, file), answers)
      } else {
        writeTemplateFile(tempDir, destDir, answers, file)
      }
    })
  })
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
    const { templateType } = answers
    const templatesFolder = isDirectory(templatePath)
    console.log(templatesFolder)
    if (!templatesFolder) {
      fs.mkdirSync(templatePath)
    }
    const downloadPath = path.join(templatePath, templateType)
    const destDir = process.cwd()
    if (fs.existsSync(downloadPath)) {
      const { name } = await loading(fetchReleasesLatest, `view the latest ${templateType} version in guthub now...`)(templateType)
      const { version } = getTemplateVersion(downloadPath)
      if (name !== version) {
        del(downloadPath, {
          force: true,
        })
        await loading(download, 'download the template now...')(downloadPath, templateType)
      }
    } else {
      await loading(download, 'download the template now...')(downloadPath, templateType)
    }
    writeTemplateFiles(downloadPath, destDir, answers)
  })
}

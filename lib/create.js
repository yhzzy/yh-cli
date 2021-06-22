const path = require('path')
const fs = require('fs')
const del = require('del')
const axios = require('axios')
const inquirer = require('inquirer')
const ejs = require('ejs')
const { promisify } = require('util')
const { loading, isDirectory } = require('../lib/utils/utils')
const { questions } = require('./utils/constants')
const downLoadGitRepo = require('download-git-repo')
const downLoadGit = promisify(downLoadGitRepo)

let repos = []

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

const download = async (path, repo) => {
  const repoPath = `yhzzy/${repo}`
  await downLoadGit(repoPath, path)
}

const getTemplateVersion = dir => {
  const packageJson = fs.readFileSync(path.join(dir, 'package.json'))
  return JSON.parse(packageJson)
}

const writeTemplateFile = (tempDir, destDir, answers, file) => {
  const isMedia = tempDir.split('/').pop() === 'img'
  if (isMedia) {
    const sourceFile = path.join(tempDir, file)
    const destPath = path.join(destDir, file)
    const readStream = fs.createReadStream(sourceFile)
    const writeStream = fs.createWriteStream(destPath)
    return readStream.pipe(writeStream)
  }
  ejs.renderFile(path.join(tempDir, file), answers, (err, result) => {
    if (err) throw err
    fs.writeFileSync(path.join(destDir, file), result)
  })
}

const writeTemplateFiles = async (tempDir, destDir, answers) => {
  fs.readdir(tempDir, (err, files) => {
    if (err) throw err
    files.forEach(async (file) => {
      // 判断复制的文件是否为文件夹
      const isDir = isDirectory(path.join(tempDir, file))
      if (isDir) {
        // 判断目标文件夹下是否有此名称文件夹
        const destDirHasThisDir = isDirectory(path.join(destDir, file))
        if (!destDirHasThisDir) {
          fs.mkdirSync(path.join(destDir, file))
        }
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
  ])
  .then(answer => {
    const { templateType } = answer
    inquirer.prompt([
      ...questions[templateType],
    ])
    .then(async (answers) => {
      const templatesFolder = isDirectory(templatePath)
      if (!templatesFolder) {
        fs.mkdirSync(templatePath)
      }
      const downloadPath = path.join(templatePath, templateType)
      const destDir = process.cwd()
      if (fs.existsSync(downloadPath)) {
        const { name } = await loading(fetchReleasesLatest, `view the latest ${templateType} version in guthub now...`)(templateType)
        const { releaseVersion } = getTemplateVersion(downloadPath)
        if (name !== releaseVersion) {
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
  })
}

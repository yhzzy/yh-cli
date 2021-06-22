const fs = require('fs')
const ora = require('ora')

/**
 * 
 * @param {*} fn 执行的方法
 * @param {*} msg 提示语言
 * @returns 
 */
const loading  = (fn, msg) => async (...args) => {
  const spinner = ora(msg)
  spinner.start()
  const res = await fn(...args)
  spinner.succeed()
  return res
}

/**
 * 
 * @param {*} dir 文件路径
 * @returns 
 */
const isDirectory = dir => {
  try{
    return fs.statSync(dir).isDirectory()
  } catch(e) {
    return false
  }
}

module.exports = {
  loading,
  isDirectory,
}

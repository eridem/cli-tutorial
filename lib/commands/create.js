'use strict'

module.exports = function (dep) {
  let cmd = {}

  cmd.command = 'create <moduleName>'
  cmd.desc = 'Scaffolding command to create a new module'
  cmd.builder = { }
  cmd.handler = function (argv) {
    const { moduleName } = argv
    const { join, shell } = dep
    const folderSrc = join(__dirname, '../scaffolding/create')
    const folderDst = join(process.cwd(), moduleName)
    shell.cp('-Rf', folderSrc, folderDst)
  }

  return cmd
}

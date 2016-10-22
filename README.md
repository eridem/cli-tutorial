# Creating a CLI tool in Node.js

- [Initial structure](#Initial-structure)
- [Making your application global](#Making-your-application-global)
- [Debugging your application](#Debugging-your-application)
- [Commands and options](#Commands-and-options)
  - [Loading all commands](#Loading-all-commands)
  - [Implementing a command](#Implementing-a-command)
- [Scaffolding commands](#Scaffolding-commands)
- [```__dirname``` vs ```cwd```](#__dirname-vs-cwd)
- [Injecting dependencies](#Injecting-dependencies)
- [Creating tests](#Creating-tests)
- [Split modules and CLI](#Split-modules-and-cli)

## Before start

- Use any terminal on Linux or Mac OSX and PowerShell on Windows.
- You have installed **[Node.js](https://nodejs.org) 6+** version.
- The syntax used on the tutorial is based on **ES6**.
- You can obtain the complete source code of this tutorial on here: <https://github.com/eridem/cli-tutorial>

# Initial structure 

Create a structure in your filesystem like this:

```
+ my-cli-app
  + lib
    + commands
    + modules
    + scaffolding
  + test
    + lib
      + commands
      + modules
  - index.js
```

Then, initialize NPM inside the root folder:

```bash
$ npm init -y  # This will create a package.json file
```

# Making your application global

Open your your ```package.json``` and define the name that will be used on the executable and the startpoint file:

```json
  "bin": {
    "mycli": "index.js"
  },
```

Then, tell npm that ```index.js``` is a Node.js executable file using ```#!/usr/bin/env node```:

```JavaScript
#!/usr/bin/env node
'use strict'

// The rest of the code will be here...
console.log("Hello world!")
```

# Debugging your application

We can say to NPM that your application in current development is a global application, so we can test it anywhere in our filesystem:

```bash
$ npm link  # Inside the root of your project
```

Then, you already can execute your application from any path on your computer:

```bash
$ mycli     # Should print "Hello world" on your screen
```

# Commands and options

A CLI tool, usually have three parts:

- The CLI ***application name***
- A ***command*** as main task to execute
- Different ***options*** to help the command to execute

```bash
$ myCliApp <command> <options>           # Structure
$ myCliApp say "Hello" --name "CLI"      # Example
```

For commands and options I use [YARGS](https://npmjs.org/package/yargs). It is pretty simple to use and it does a lot of validations for us.

```bash
$ npm install --save yargs               # Inside the root of your project
```

## Loading all commands

Modify the ```index.js``` file to use this package. We can use ```commandDir``` function from ```yargs``` to load each command in this folder (example below).

```JavaScript
#!/usr/bin/env node
'use strict'

const { join } = require('path')
const yargs = require('yargs')

yargs
  .commandDir(join(__dirname, 'lib', 'commands'))
  .demand(1)
  .help()
```

## Implementing a command

A command is specified in one file inside the folder ```lib/commands```. It needs to ```export``` some parts. For example:

```javascript
'use strict'

exports.command = 'say <prefix>'
exports.desc = 'Prints: <prefix> name surname'
exports.builder = {
  name: {
    alias: 'n',
    describe: 'Pass the name',
    demand: true
  },
  surname: {
    alias: 's',
    describe: 'Pass the surname',
    demand: false
  }
}
exports.handler = function (argv) {
  const { prefix, name, surname } = argv
  const message = prefix + (name ? ' ' + name : '') + (surname ? ' ' + surname : '')
  console.log(message)
}
```

Where:

- ```exports.command```: the name and arguments of the command
  - ```say``` will be the name of the command
  - ```<prefix>``` will be used as a mandatory option
- ```exports.desc```: description that will appear on the help information
- ```exports.builder```: used to define additional options
  - Each item is an option.
  - ```demand: true``` implies that it is mandatory to use this option with this command
  - ```yargs``` will do all the validation for us, so we do not need to worry for it
- ```exports.hander```: function that will be called if the command is 
  - After ```yargs``` do all validations for us, the argument ```argv``` will contain all values of the options passed on the CLI

# Scaffolding commands

If we would like to do operations like we were writing a ***bash*** script, we can use the following package:

```bash
$ npm install --save shelljs
```

This will give us the possibility to use commands like ```mkdir```, ```cp```, ```touch```, ```mv```, ... and those will work in Linux and Windows without distinction.

This could be very useful to do scaffolding tools, for instance recreate files structures as we were working in a terminal. Here an example:

```
# Append the following structure into your project and add random data into the files

+ my-cli-app
  + lib
    + scaffolding
      + create
        - module-file.js
        - another-module-file.json
    + commands
      - create.js
```

And we create a command to copy those files inside the ```lib/commands/create.js``` file.

```javascript
'use strict'

const shell = require('shelljs')
const { join } = require('path')

exports.command = 'create <moduleName>'
exports.desc = 'Scaffolding command to create a new module'
exports.builder = { }
exports.handler = function (argv) {
  const { moduleName } = argv
  const folderSrc = join(__dirname, '../scaffolding/create')
  const folderDst = join(process.cwd(), moduleName)
  shell.cp('-Rf', folderSrc, folderDst)
}
```

Then, we just need to run:

```bash
$ mycli create myModule
```

And it will create a new folder in the ***current directory*** with the name ```myModule``` and the contents inside ```lib/scaffolding/create```.

# __dirname vs cwd

When we are working with CLI tools we need to think about how to do references to the files:

- Do we require a file inside our CLI project? ```__dirname```
- Do we want to know where the CLI has been executed? ```process.cwd()```

## __dirname

Imagine we have our project in the path ```/Users/XXX/my-cli-app/```, and we are working on the file ```lib/commands/create.js```:

```javascript
const thisFileFolderPath = __dirname
// === '/Users/XXX/my-cli-app/lib/commands'

const folderSrc = require('path').join(thisFileFolderPath, '../scaffolding/create') 
// === '/Users/XXX/my-cli-app/lib/scaffolding/create'
```

## cwd

```cwd``` gives us the path where the CLI tool was called. In the *scaffolding* previous example, we wanted to copy files to the current path where the tool was called. Imagine we call our global tool from ```/Users/XXX/documents/another-project/src/```

```javascript
const whereIWasCallPath = process.cwd()
// === /Users/XXX/documents/another-project/src

const folderToCreatePath = require('path').join(whereIWasCallPath, 'example-module')
// === /Users/XXX/documents/another-project/src/example-module
```

## Use CWD as optional argument

My recommendation is to pass the CWD through an option in our app, so we can invoke our CLI tool from any path and setting it up as current working directory. We can do this easily, adding to our ```index.js``` file:

```javascript
// ...
const { join, resolve } = require('path')
// ...

// Switch CWD if specified from options
const cwd = resolve(yargs.argv.cwd || process.cwd())
process.chdir(cwd);

// ...
yargs
  .help()
  .options({ cwd: { desc: 'Change the current working directory' } })
  .demand(1)
  .argv
// ...
```

# Injecting dependencies

Goals of this section are:

- I want to keep clean the code, adding all dependencies on ```index.js```
- I want all dependencies to load automatically on each command, so commands focus on their business and we avoid a lot of code
- I want to load external dependencies and my own project dependencies
- I want to make testable code :-)

In order to match these criterias, we will create an structure like:

```
+ my-cli-app
  + lib
    + commands
    + modules
```

- Where all commands have references to external packages, such as: ```console```, ```process```, ```shell```, ```path```, ...
- Where all commands have references to internal modules we decine inside ```modules```. For instance, a ```log``` that we will implement later.
- At the same time, all modules have references to external packages and their own module packages.

Before start, let's add some packages we will use:

```bash
$ node install --save require-dir camelcase chalk
```

## Adapting our commands

Firstly we will inject all our dependencies into our commands. We will modify the structure of the commands to look like this:

```javascript
'use strict'

module.exports = function (dep) {
  let cmd = {}
  cmd.command = '...'
  cmd.desc = '...'
  cmd.builder = {}
  cmd.handler = function (argv) {}
  return cmd
}
```

For example, the ```handler``` function of our ```lib/commands/create.js``` command will look like:

```javascript
  cmd.handler = function (argv) {
    const { moduleName } = argv
    const { join, shell, process } = dep
    const folderSrc = join(__dirname, '../scaffolding/create')
    const folderDst = join(process.cwd(), moduleName)
    shell.cp('-Rf', folderSrc, folderDst)
  }
```

As we can see, we can load external dependencies such as ```join```, ```shell```, ```process``` and ```_dirname``` from the ```dep``` variable. Nobody will stop us now to mock those references! ;-)

## External references

We need to modify our ```index.js``` file to load all external dependencies and the structure we created for our commands. We cannot use ```yargs.commandDir``` function anymore, but we will do it very similar:

```javascript
const requireDir = require('require-dir')
const { join, resolve } = require('path')
const shell = require('shelljs')
const yargs = require('yargs')
const colors = require('chalk')

// External dependencies to pass to the commands
let dep = { join, resolve, console, shell, colors, process }

// Load commands from folder and pass dependencies
const commandsFn = requireDir(join(__dirname, 'lib', 'commands'))
const commands = Object.keys(commandsFn).map((i) => commandsFn[i](dep))

// Init CLI commands and options
commands.forEach(cmd => yargs.command(cmd.command, cmd.desc, cmd.builder, cmd.handler))
yargs
  .help()
  .demand(1)
  .argv
```

Using this technique, we load all dependencies in an object and pass it through each command.

## Internal references

In the same way that the [External references](#External-references) chapter, we will append to ```dep``` our new dependencies from the ```modules``` folder.

So far we did not create any, so let's add an example of a *logger* module in a new file called ```lib/modules/log.js```:

```javascript
'use strict'

module.exports = function (dep) {
  let result = {}

  result.debug = function (title, message) {
    const { console } = dep
    const { yellow, blue, gray } = dep.colors
    console.log(yellow('[MyCli]') + (title ? blue(' ' + title) : '') + (message ? gray(' ' + message) : ''))
  }

  return result
}
```

We will use this ```logger``` instead of ```console``` in the ```lib/commands/say.js``` command:

```javascript
  cmd.handler = function (argv) {
    const { prefix, name, surname } = argv
    const { log } = dep
    const message = prefix + (name ? ' ' + name : '') + (surname ? ' ' + surname : '')
    log.debug(message)
  }
```

Now, we are ready to inject our new modules to all our commands. Note that the modules, at the same time, get injected the functionality of other modules. Open the ```index.js``` file and add:

```javascript
const camelCase = require('camelcase')

// External dependencies to pass to the commands
//...

// Internal dependencies
const inDepFns = requireDir(join(__dirname, 'lib', 'modules'))
Object.keys(inDepFns).forEach(name => { dep[camelCase(name)] = inDepFns[name](dep) })

// Load commands from folder and pass dependencies
// ...
```

As we can see, we append to ```dep``` all our internal modules inside the folder ```lib/modules/``` and, at the same time, they get initialized with the rest of dependencies.

We use ```camelcase``` in order to generate automatically names for our modules in the *camelcase* format. For instance:

```
lib/modules/log.js           =    log
lib/modules/foo-module.js    =    fooModule
lib/modules/bar-module.js    =    barModule
```

# Creating tests

After the chapter [Injecting dependencies](#Injecting-dependencies), we should have everything ready to test our apps. All references are passed to each module, which gives us the advantage to mock them.

We will use ```mocha``` and ```nyc``` for testing and coverage. We will need to install them globally:

```bash
$ npm install --global mocha nyc
```

And we will modify our ```package.json``` to run the tests:

```json
  "scripts": {
    "test": "nyc --cache mocha --timeout=8000 --check-leaks test/**/*.js"
  },
```

Each time we want to run tests, we can execute the command ```npm test``` inside our project.

```bash
$ npm test
```

Explain how to create tests with mocha is outside this tutorial, but I can show one of the tests we can do to our command ```say.js```:

```javascript
'use strict'
/* global describe, before, it */

require('chai').should()

describe('command/say.js', function () {
  describe('.handler', function () {
    // Mocks
    let _latestLogMessage
    const log = { debug: function (msg) { _latestLogMessage = msg } }

    // Target
    const _module = require('../../../lib/commands/say')
    let _target

    before(function () {
      _latestLogMessage = null
      _target = _module({ log })
    })
    it('should print prefix and name', function () {
      _target.handler({ prefix: 'Hello', name: 'CLI' })
      _latestLogMessage.should.equal('Hello CLI')
    })
    it('should print prefix, name and surname', function () {
      _target.handler({ prefix: 'Hello', name: 'CLI', surname: 'ILC' })
      _latestLogMessage.should.equal('Hello CLI ILC')
    })
  })
})
```

# Split modules and CLI

So far we have a complete CLI tool. But we would like to export the commands as modules for our package. It could be useful in other projects that does not require a CLI.

The simplest way is export the packages from our ```index.js``` and create another file called ```bin/cmd.js``` to use it as CLI start point.

```
+ bin
  - cmd.js
- index.js
```

We can explit the initialization of our modules from the commands:

```javascript
// index.js
'use strict'

const { join, resolve } = require('path')
const camelCase = require('camelcase')
const requireDir = require('require-dir')
const colors = require('chalk')
const shell = require('shelljs')

// External dependencies to pass to the commands
let dep = { join, resolve, console, colors, shell, process }

// Internal dependencies
const inDepFns = requireDir(join(__dirname, 'lib', 'modules'))
Object.keys(inDepFns).forEach(name => {
  dep[camelCase(name)] = inDepFns[name](dep)})

// Load commands from folder and pass dependencies
const commandsFn = requireDir(join(__dirname, 'lib', 'commands'))
const commands = Object.keys(commandsFn).map((i) => commandsFn[i](dep))

// Export commands and modules separatelly
const modules = commands.reduce((pre, cur) => { pre[cur.name] = cur.value; return pre }, {})
module.exports = { commands, modules }
```

As we can see, we will export ```{ commands, modules }```. The CLI tool may take ```commands``` already recreated and any other package could get our internal modules from ```modules```.

Now, we split ```YARGS``` and the needed CLI logic into the ```bin/cmd.js``` file:

```javascript
#!/usr/bin/env node
'use strict'

const { join, resolve } = require('path')
const yargs = require('yargs')
const { homepage, version } = require(join(__dirname, '../package.json'))
const { commands } = require('../index.js')

// Switch CWD if specified from options
const cwd = resolve(yargs.argv.cwd || process.cwd())
process.chdir(cwd);

// Init CLI commands and options
commands.forEach(cmd => yargs.command(cmd.command, cmd.desc, cmd.builder, cmd.handler))
yargs
  .help()
  .options({ cwd: { desc: 'Change the current working directory' } })
  .demand(1)
  .epilog((homepage ? `| Documentation: ${homepage}\n` : '') + (version ? `| Version: ${version}` : ''))
  .argv
```

# Get the code

How you enjoyed this tutorial. Updates about this tutorial and the source code can be found under:

<https://github.com/eridem/cli-tutorial>

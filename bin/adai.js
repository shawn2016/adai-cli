#!/usr/bin/env node

require('colorful').colorful();
var chalk = require('chalk');

var program = require('commander');
var fs = require('fs');
var path = require('path');
var spawn = require('cross-spawn');

program
  .version(require('../package').version, '-v, --version')
  .usage('<command> [options]')
  .on('--help', printHelp)
  .on('--h', printHelp)
  .on('list', list)
  .parse(process.argv);

var subcmd = program.args[0];
var args = process.argv.slice(3);

const aliases = {
  "i": "init",
  "b": "build",
  "d": "dev"
}

if (aliases[subcmd]) {
  subcmd = aliases[subcmd];
}

if (!subcmd || subcmd === 'help') {
  program.help();
} else if (subcmd && subcmd === 'list') {
  list();
} else {
  execTask(subcmd);
}

function list() {
  var projectList = [{
    name: 'vue-webpack',
    desc: '一个最简易的vue项目'
  }, {
    name: 'vue-eslint-webpack',
    desc: '一个简易的vue项目,含有eslint规范'
  },{
    name: 'vue-router-webpack',
    desc: '一个简易的vue项目,含有vue-router'
  }, {
    name: 'vue-router-eslint-webpack',
    desc: '一个简易的vue项目,含有vue-router,eslint规范'
  },{
    name: 'react-router-webpack',
    desc: '一个简易的react项目,含有react-router'
  },{
    name: 'react-router-redux-eslint-webpack',
    desc: '这是一个React脚手架，没有使用create-react-app标准的React+Redux分层结构,由webpack4构建'
  },{
    name: 'react-router-redux-eslint-parcel',
    desc: '这是一个React脚手架，没有使用create-react-app标准的React+Redux分层结构,由parcel构建'
  }]
  console.log()
  console.log('Available official templates:')
  console.log()
  for (let index = 0; index < projectList.length; index++) {
    const element = projectList[index];
    console.log(chalk.green(` ★  ${element.name} - ${element.desc}`))
  }
  console.log()
}
function printHelp() {
  console.log();
  console.log('  Package Commands:');
  console.log();
  console.log('    init           generate a new project from a template');
  console.log('    list           list available official templates');
  console.log();
}

function execTask(cmd) {
  console.log(chalk.bold.bgRed(' ADAI CLI v' + require('../package').version + ' '));
  var file = path.join(__dirname, `/adai-${cmd}.js`);
  fs.stat(file, (err) => {
    if (err) {
      console.log(chalk.red(`adai ${cmd} is not supported!`));
      process.exit(1);
    }

    spawn(file, args, {
      stdio: 'inherit'
    }).on('close', (code) => {
      process.exit(code);
    });
  })
}
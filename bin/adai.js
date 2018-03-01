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
  } else {
    execTask(subcmd);
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
    console.log(chalk.bold.bgRed(' ADAI CLI v' + require('../package').version +' '));
    var file = path.join(__dirname, `/adai-${cmd}.js`);
    fs.stat(file, (err) => {
      if (err) {
        console.log(chalk.red(`adai ${cmd} is not supported!`));
        process.exit(1);
      }
  
      spawn(file, args, {
        stdio: 'inherit'
      }).on('close', (code) => {
        console.log(chalk.red(`adai exit with code ${code}`));
        process.exit(code);
      });
    })
  }
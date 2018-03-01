#!/usr/bin/env node

require('colorful').colorful();
var List = require('prompt-list');
var chalk = require('chalk');

var path = require('path');
var ora = require('ora'); // 优雅的loading
var home = require('user-home'); // 获取用户主目录的路径
var program = require('commander'); // node操作命令
var download = require('download-git-repo'); // 下载并提取git存储库
var inquirer = require('inquirer') // 交互式命令行工具
var generate = require('../src/util/generate');

program
    .usage('<project-name>')
    .parse(process.argv);

program.on('--help', function () {
    console.log()
    console.log('      Available official templates:')
    console.log()
    console.log('    - template: vue');
    console.log('    - template: react');
    console.log()
})



function help() {
    program.parse(process.argv)
    if (program.args.length < 1) return program.help()
}
help()

var enquirer = new List({
    name: 'Templates',
    message: 'Which template would you like to choose?',
    default: 'vue',
    choices: [
        'vue',
        'react'
    ]
});

enquirer.run().then(function (answers) {
    console.log(chalk.green('Use Template ' + answers));
    var projectName = '';
    var projectRouter = '';
    var projectESLint = '';
    // 修改项目名字
    inquirer.prompt([
        {
            type: 'Input',
            name: 'projectName',
            message: 'Project name?',
            default: answers,
        }, {
            type: 'confirm',
            name: 'projectRouter',
            message: 'Install vue-router?',
            default: true
        },
        {
            type: 'confirm',
            name: 'projectESLint',
            message: 'Use ESLint to lint your code?',
            default: true
        }
    ]).then((answersValue) => {
        var answersTitle = answers
        projectName = answersValue.projectName;
        projectRouter = answersValue.projectRouter;
        projectESLint = answersValue.projectESLint;
        if (projectRouter && projectESLint) {
            answersTitle = `${projectName}-router-eslint`
        } else if (projectRouter == 'true' && projectESLint == 'false') {
            answersTitle = `${projectName}-router`
        } else if (!projectRouter == 'false' && projectESLint == 'true') {
            answersTitle = `${projectName}-eslint`
        } else if (!projectRouter == 'false' && !projectESLint == 'false') {
            answersTitle = `${projectName}`
        }
        console.log(chalk.green(`download template ${answersTitle}...`))
        // download template
        var tmplType = answersTitle.toLowerCase();
        var rawName = program.args[0];
        var inPlace = !rawName || rawName === '.';
        var name = inPlace ? path.relative('../', process.cwd()) : rawName;
        var to = path.resolve(rawName || '.');
        var clone = program.clone || false;
        var tmp = path.join(home, '.adai-cli-template')
        function downloadAndGenerate(template) {
            var spinner = ora('downloading template....')
            spinner.start()
            download(template, tmp, { clone: clone }, function (err) {
                spinner.stop()
                if (err) console.log(chalk.red('Failed to download repo ' + template + ': ' + err.message.trim()))
                generate(name, tmplType, tmp, to, function (err) {
                    if (err) console.log(chalk.red(err))
                    console.log(chalk.green('Project generation success.', name));
                    console.log(chalk.green('===================================='));
                    console.log(chalk.green('  cd', name));
                    console.log(chalk.green('  npm install'));
                    console.log(chalk.green('  npm start'));
                    console.log(chalk.green('===================================='));
                })
            })
        }
        downloadAndGenerate('shawn2016/adai-cli-template');
    })
})
    .catch(function (err) {
        console.log(err);
    });



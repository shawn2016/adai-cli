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

// 所有模板
/**
 * vue-webpack
 * vue-router-webpack
 * vue-router-eslint-webpack
 * vue-eslint-webpack
 * react-router-webpack
 * react-router-webpack
 * react+router+redux+eslint+parcel
 */
enquirer.run().then(function (answers) {
    console.log(chalk.green('Use Template ' + answers));
    // 获取所有问题
    var answersArray = getAnswersArray(answers);
    // 修改项目名字
    inquirer.prompt(answersArray).then((answersValue) => {
        var answersTitle = getAnswersTitle(answers, answersValue);
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
                    if (err) {
                        console.log(chalk.red('没有找你想要的项目模板！'))
                        console.log(chalk.red(err))
                        return false;
                    }
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
// 获取最终项目名称
function getAnswersTitle(answers, answersValue) {
    var titleName = answers + ''
    for (var i in answersValue) {
        if (i !== 'projectName') {
            var desc = ''
            if (typeof answersValue[i] === 'boolean' && answersValue[i]) {
                desc = i.substring(7).toLocaleLowerCase();
                if (desc === 'statemanage' && answers === 'react') {
                    desc = 'redux'
                }
                if (desc === 'statemanage' && answers === 'vue') {
                    desc = 'vuex'
                }
            } else if (typeof answersValue[i] === 'string') {
                desc = answersValue[i]
            }
            if (desc) {
                titleName += '-' + desc
            }
        }
    }
    return titleName;
}
// 获取所有问题
// react+router+redux+eslint+webpack
function getAnswersArray(answers) {
    console.log(program.args)
    // 项目名字
    var answersArray = [{
        type: 'Input',
        name: 'projectName',
        message: 'Project name?',
        default: program.args[0],
    }];
    // react 模板
    if (answers === 'react') {
        answersArray.push({
            type: 'confirm',
            name: 'projectRouter',
            message: 'Install react-router?',
            default: true
        }, {
                type: 'confirm',
                name: 'projectStateManage',
                message: 'Install redux?',
                default: true
            })
    }
    // vue 模板
    if (answers === 'vue') {
        answersArray.push({
            type: 'confirm',
            name: 'projectRouter',
            message: 'Install vue-router?',
            default: true
        }, {
                type: 'confirm',
                name: 'projectStateManage',
                message: 'Install vuex?',
                default: true
            })
    }
    // eslint 
    answersArray.push({
        type: 'confirm',
        name: 'projectEslint',
        message: 'Use ESLint to lint your code?',
        default: true
    }, {
            type: 'list',
            message: 'which build method do you need:',
            name: 'projectBuild',
            choices: ['webpack', 'parcel', 'gulp']
        });
    console.log(answersArray)
    return answersArray
}

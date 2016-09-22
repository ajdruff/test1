
var path = require('path');
var gulp = require('gulp');
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander
var project_dir = path.join(__dirname, '../');//point to directory containing package.json
var ger_dir = __dirname; //point to directory containing package.json

var
        requireFrom = require('requirefrom')
        , modules = requireFrom('ger/modules/')
       // ,help_tasks=modules('help-tasks.js')(gulp, argv, project_dir, ger_dir)



//tasks
// modules('project.js')(gulp, argv, project_dir, ger_dir);
// modules('package.js')(gulp, argv,project_dir,ger_dir);
modules('sandbox.js')(gulp, argv, project_dir, ger_dir);
modules('ger-tasks.js')(gulp, argv, project_dir, ger_dir);
modules('help-tasks.js')(gulp, argv, project_dir, ger_dir)




    
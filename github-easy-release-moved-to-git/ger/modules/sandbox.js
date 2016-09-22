


module.exports = function (gulp, argv, project_dir, ger_dir) {
var fs = require('fs'); //file system library
var path = require("path")
var ger_dir = path.join(__dirname, '../../');//point to directory containing package.json
var project_dir = path.join(__dirname, '../../../');//point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander

var runSequence = require('run-sequence');//force synchronous execution


var
     //   requireFrom = require('requirefrom')
     //   , modules = requireFrom('ger/modules')
     //   , exec = modules('exec.js')        
     exec = require("./exec.js")  //to include another private module



    gulp.task('sandbox', function (callback) {
        runSequence(
                'changelog',
                function (error) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        // console.log('RELEASE ' + getProjectVersion() + ' FINISHED SUCCESSFULLY');
                    }
                    callback(error);
                });
    });


    gulp.task('sandbox-exec', function (cb) {

        exec.execCmd(
                "ls -ail",
                {},
                function (err, stdout, stderr) {
                    if (err) {
                        throw err;
                    }
                    if (stderr) {
                        console.log('Something went wrong:' + stderr);
                        return cb();
                    }
                    console.log(stdout);
                    return cb();
                });
            
                
                return;


    });



};



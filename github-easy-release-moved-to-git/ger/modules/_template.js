/*
 *  XXXX-tasks.js
 *  
 *  XXX tasks, meant to be supporting 'private' and called by other public tasks
 */


module.exports = function (gulp, argv, project_dir, ger_dir) {


//public modules
    var path = require("path")
            , runSequence = require('run-sequence')//force synchronous execution
,fs = require('fs')

//private modules
    var requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')
            , package = modules('package.js')(gulp, argv, project_dir, ger_dir)
            , help = modules('help.js')(gulp, argv, project_dir, ger_dir)
            , project = modules('project.js')(gulp, argv, project_dir, ger_dir)
            , prompt = modules('prompt.js')(gulp, argv, project_dir, ger_dir)
            , exec = modules('exec.js')(gulp, argv, project_dir, ger_dir)
            , template_mod = modules('template.js')(gulp, argv, project_dir, ger_dir)
            , release_mod = modules('release.js')(gulp, argv, project_dir, ger_dir)
            , tag_mod = modules('tag.js')(gulp, argv, project_dir, ger_dir)




//task modules
    modules('release-tasks.js')(gulp, argv, project_dir);//expose gulp tasks


/**
     * ger-test (TASK)
     *
     * Wrapper around changelog - Creates a changelog based on current version and commits in angular style
     * @param string taskName
     * @return function Callback
     */

    gulp.task('test', function ger_test(callback) {


        runSequence(
                'changelog',
                function (error) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log('success');
                    }
                    callback(error);
                });



    });






 module.myFunction = function () {

}

return module;


}
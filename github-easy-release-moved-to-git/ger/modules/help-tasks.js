/*
 *  help-tasks.js
 *  
 *  Builds help tasks from help.json definitions.
 */



module.exports = function (gulp, argv, project_dir, ger_dir) {



//public modules
    var path = require("path")

//private modules
    var requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')
            , help = modules('help.js')(gulp, argv, project_dir, ger_dir)






    module.createHelpTasks = function () {
        
        
    /*
     * Create currentTask name (see http://stackoverflow.com/a/27535245/3306354 _  
     */
    gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask;
    gulp.Gulp.prototype._runTask = function (task) {
        this.currentTask = task;
        this.__runTask(task);
    }




        var task_name;


        var task_names = help.getHelpTaskNames();
        for (task_index in task_names) {


            task_name = task_names[task_index];

            gulp.task(task_name + '-help', function (callback) {


                var task_name = this.currentTask.name.replace('-help', '');
                help.showHelp(help.getTaskHelp(task_name));

                return callback();

            });




        }


    }

    //need to create Help tasks when module is included
    module.createHelpTasks();
    return module;


}





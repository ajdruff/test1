
var fs = require('fs'); //file system library
var package_dir = __dirname + "/../../"; //point to directory containing package.json
var sprintf = require("sprintf-js").sprintf; //formatting
var chalk = require('chalk');//console text style formatting


module.exports = function (gulp) {

    gulp.task('ger-help-all', function (callback) {

        showAllHelp();


    });


    /*
     * Help Tasks
     */
    gulp.task('ger-help', function (callback) {
        module.exports.showHelp(module.exports.getTaskHelp('ger'));
        return callback();

    });

    gulp.task('ger-version-help', function (callback) {
        module.exports.showHelp(module.exports.getTaskHelp('ger-version'));
        return callback();

    });

    gulp.task('ger-config-help', function (callback) {
        module.exports.showHelp(module.exports.getTaskHelp('ger-config'));
        return callback();

    });


    gulp.task('ger-list-help', function (callback) {
        module.exports.showHelp(module.exports.getTaskHelp('ger-list'));
        return callback();

    });

    gulp.task('ger-delete-help', function (callback) {
        module.exports.showHelp(module.exports.getTaskHelp('ger-delete'));
        return callback();

    });

    gulp.task('ger-delete-all-help', function (callback) {
        module.exports.showHelp(module.exports.getTaskHelp('ger-delete-all'));
        return callback();

    });

    gulp.task('ger-major-help', function (callback) {
        module.exports.showHelp(module.exports.getTaskHelp('ger-major'));
        return callback();

    });
    gulp.task('ger-minor-help', function (callback) {
        module.exports.showHelp(module.exports.getTaskHelp('ger-minor'));
        return callback();

    });
    gulp.task('ger-patch-help', function (callback) {
        module.exports.showHelp(module.exports.getTaskHelp('ger-patch'));
         return callback();

    });
    gulp.task('ger-prerelease-help', function (callback) {
        module.exports.showHelp(module.exports.getTaskHelp('ger-prerelease'));
        return callback();

    });


};


/**
 * Get Help
 *
 * Returns the help object
 * @param void $content The shortcode content
 * @return string The parsed output of the form body tag
 */

module.exports.getHelp = function () {
    if (!fs.existsSync(package_dir + 'help.json')) {
        throw new Error("help not found");
        return;
    }

    // We parse the json file instead of using require because require caches
    // multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync(package_dir + 'help.json', 'utf8'));
}



module.exports.showAllHelp = function () {
    var help = module.exports.getHelp();

    for (task in help.tasks) {
        task = help.tasks[task];

        module.exports.showHelp(task);
    }

    return;

}


/**
 * Get Task Help
 *
 * given a task name, returns its help object
 * @param string task_name The name of the task as defined in help.json
 * @return void
 */
module.exports.getTaskHelp = function (task_name) {
    var help = module.exports.getHelp(); //get all the help objects
    var task_help;

//search for the help object that matches the task name we need
    for (task in help.tasks) {
        task = help.tasks[task];
        if (task.name === task_name) {
            return(task);

        }


    }
}
module.exports.showHelp = function (help) {

    var option;
    var option_help;
    var left_margin = 0;
    console.log(chalk.gray('Task:') + "  " + chalk.bold(help.name));
    console.log(sprintf("%" + left_margin + "s" + "%10s", "", chalk.bold("Usage: ") + help.usage));
    console.log(sprintf("%" + left_margin + "s" + "%10s", "", chalk.bold("Description: ") + help.description));
    //show options

    if (help.options.length !== 0) {

        console.log(sprintf("%" + left_margin + "s" + chalk.bold("Options:"), ""));
        for (option in help.options) {
            option_help = help.options[option];

            console.log(sprintf("%" + left_margin + "s" + "%3s %10s %-60s ", "", option_help.option, option_help.help, option_help.type));

            // console.log(sprintf("%3s", option_help.option) + sprintf("%5s", '') + sprintf("%-60s", option_help.help) + sprintf("%10s", option_help.type));


        }
    }

    //show examples
    if (help.examples.length !== 0) {
        console.log(sprintf("%" + left_margin + "s" + chalk.bold("Examples:"), ""));
        for (var example in help.examples) {
            example = help.examples[example];

            console.log(sprintf("%5s", '') + sprintf("%-60s", example.title));
            console.log(sprintf("%20s", '') + sprintf("%-60s", example.code));
        }
    }



    console.log("---------------------");




    return;
}


/**
 * Show Default Help
 *
 * Shows ger-help + all available tasks
 
 * @param void
 * @return void
 */
module.exports.showDefaultHelp=function() {

    module.exports.showHelp(module.exports.getTaskHelp("ger"));
    console.log();


    var help = module.exports.getHelp();
    var left_margin = 5;
    console.log(chalk.black.bgWhite("Available Tasks"));
    console.log("For help with all tasks, gulp ger-help-all");
    console.log("For help with any specific task, gulp taskname-help, e.g: gulp ger-delete-all-help");

    for (task in help.tasks) {
        task = help.tasks[task];

        console.log(chalk.bold(task.name));

//console.log(sprintf("%" + left_margin + "s" + " gulp %2$s-help. ", "", task.name));


    }


}


/*
 *  help.js
 *  
 *  help tasks
 */


module.exports = function (gulp, argv, project_dir, ger_dir) {


//public modules
    var path = require("path")
            , fs = require('fs') //file system library
            , sprintf = require("sprintf-js").sprintf //formatting
            , chalk = require('chalk')//console text style formatting








    /**
     * Get Help
     *
     * Returns the help object
     */

    module.getHelp = function () {
        if (!fs.existsSync(path.join(ger_dir ,'help.json'))) {
            throw new Error("help not found");
            return;
        }

        // We parse the json file instead of using require because require caches
        // multiple calls so the version number won't be updated
        return JSON.parse(fs.readFileSync(path.join(ger_dir , 'help.json'), 'utf8'));
    }



    module.showAllHelp = function () {
        var help = module.getHelp();

        for (task in help.tasks) {
            task = help.tasks[task];

            module.showHelp(task);
        }

        return;

    }




    /**
     * Get HelpTaskNames
     *
     * returns an array of help task names, taken from help.json file.
     * @param string task_name The name of the task as defined in help.json
     * @return void
     */
    module.getHelpTaskNames = function () {
        var help = module.getHelp(); //get all the help objects
        var task_help;
        var task_names=[];

//search for the help object that matches the task name we need
        for (task in help.tasks) {
            task = help.tasks[task];
            task_names.push(task.name);



        }
        return task_names;
    }
    
    
    /**
     * Get Task Help
     *
     * given a task name, returns its help object
     * @param string task_name The name of the task as defined in help.json
     * @return void
     */
    module.getTaskHelp = function (task_name) {
        var help = module.getHelp(); //get all the help objects
        var task_help;

//search for the help object that matches the task name we need
        for (task in help.tasks) {
            task = help.tasks[task];
            if (task.name === task_name) {
                return(task);

            }


        }
    }
    module.showHelp = function (help) {

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
    module.showDefaultHelp = function () {

        module.showHelp(module.getTaskHelp("ger"));
        console.log();


        var help = module.getHelp();
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
    return module;
}
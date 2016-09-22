
/*
 *  prompt.js
 *  
 *  Prompts
 */


module.exports = function (gulp, argv, project_dir, ger_dir) {
    
//public modules
    var prompt = require("prompt");//prompt

            




/**
 * Prompt Yes No
 *
 * Provides a prompt for a simple yes/no question
 * @param string $content The shortcode content
 * @return string The parsed output of the form body tag
 */
module.promptYesNo = function (options, callback) {
    if (argv.y) { //override with a -y
        return callback(true);
    }

    var schema = {
        properties: {
            continue: {
                description: options.prompt_message,
                default: options.default_answer,
                pattern: /^[y,n,Y,N]+$/,
                message: "Please enter 'y/Y' or 'n/N'",
                required: true
            }
        }
    };

    // 
    // Start the prompt 
    // 

    prompt.colors = false;
    prompt.message = ("");
    prompt.start();


    prompt.get(schema, function (err, result) {


        if (result.continue === 'n' || result.continue === 'N') {
            return callback(false);
        } else {


            return callback(true);

        }

    });
}

return module;
}
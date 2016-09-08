
var fs = require('fs'); //file system library
var package_dir = __dirname + "/../../"; //point to directory containing package.json
var project_package_dir = __dirname + "/../../../"; //point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander



/**
 * Prompt Yes No
 *
 * Provides a prompt for a simple yes/no question
 * @param string $content The shortcode content
 * @return string The parsed output of the form body tag
 */
 module.exports.promptYesNo = function (options, callback) {
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

/*
 *  token.js
 *  
 *  Handles configuring the GitHub API token
 */


module.exports = function (gulp, argv, project_dir, ger_dir) {


//public modules
    var path = require("path")
            , runSequence = require('run-sequence')//force synchronous execution
            , fs = require('fs')


//private modules
    var requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')



    /**
     * Get GitHub Token
     *
     * @param void
     * @return string The github token
     */
    module.getGitHubToken = function () {

        var token_file = path.join(ger_dir, 'token.json');

        if (!fs.existsSync(token_file)) {
            throw new Error("GitHub API Token not set.  Run gulp config -c token=GITHUB_TOKEN to set API token.");
            return;
        }

        // We parse the json file instead of using require because require caches
        // multiple calls so the version number won't be updated
        return JSON.parse(fs.readFileSync(token_file, 'utf8')).token;
    }

    return module;


}

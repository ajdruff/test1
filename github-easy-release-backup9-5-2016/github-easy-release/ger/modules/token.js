
var fs = require('fs'); //file system library
var package_dir = __dirname + "/../../"; //point to directory containing package.json
var project_package_dir = __dirname + "/../../../"; //point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander


module.exports = function (gulp) {

};








/**
 * Get GitHub Token
 *
 * @param void
 * @return string The github token
 */
 module.exports.getGitHubToken = function (){
    if (!fs.existsSync(__dirname + '/token.json')) {
        throw new Error("GitHub API Token not set.  Run gulp config -c token=GITHUB_TOKEN to set API token.");
        return;
    }

    // We parse the json file instead of using require because require caches
    // multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync(__dirname + '/token.json', 'utf8')).token;
}  

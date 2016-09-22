
/*
 *  project.js
 *  
 *  Parses the project's package.json data
 */


module.exports = function (gulp, argv, project_dir, ger_dir) {


//public modules
    var fs = require('fs') //file system library
            , ghparse = require('parse-github-repo-url') //extract github info from repo url
            , path = require('path');

//private modules
    var requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')




    /**
     * Set Project Version
     *
     * Updates Version Number in the package.json configuration of the release project
     * @param string version The version number to write to package.json
     * @return void
     */

    module.setVersion = function (version, cb) {

        var packagejson = JSON.parse(fs.readFileSync(path.join(project_dir, 'package.json'), 'utf8'));



        if (typeof argv.n === 'boolean') {
            throw new Error("Please supply a version number to set version.");
        }


        packagejson['version'] = version;

        fs.writeFileSync(path.join(project_dir, 'package.json'), JSON.stringify(packagejson, null, 2, function (err) {

            if (err)
                throw err;
            cb();
        }));



    }



    /**
     * Get the Project's Package.json object
     *
     * Returns the package.json global object
     * @param void
     * @return object The object parsed from package.json
     */
    module.getPackage = function () {
        var package_file = path.join(project_dir, 'package.json');

        if (fs.existsSync(package_file)) {
            return JSON.parse(fs.readFileSync(package_file, 'utf8'));
        } else {

            throw new Error("package.json cannot be found");
        }
    }

    /**
     * Get GitHub Username
     *
     * Parses the project's repository url to get its username
     * ref: https://www.npmjs.com/package/parse-github-repo-url
     *
     * @param void
     * @return string The GitHub username
     */

    module.getGitHubUserName = function () {

        return (ghparse(module.getPackage().repository.url)['0']);


    }

    /**
     * Get GitHub Repo Name
     *
     * Parses the project's repository url to get its repo name
     * ref: https://www.npmjs.com/package/parse-github-repo-url
     * @param void
     * @return string The GitHub repo
     */
    module.getGitHubRepoName = function () {

        return ghparse(module.getPackage().repository.url)['1'];






    }


    /**
     * Get Project Version
     *
     * @param void
     * @return string The version in the package file
     */
    module.getVersion = function () {
        // We parse the json file instead of using require because require caches
        // multiple calls so the version number won't be updated
        return JSON.parse(fs.readFileSync(path.join(project_dir, 'package.json'), 'utf8')).version;
    }


    return module;
}
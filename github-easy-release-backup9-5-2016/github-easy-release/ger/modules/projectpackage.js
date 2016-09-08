var fs = require('fs'); //file system library
var project_package_dir = __dirname + "/../../../"; //point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander
var bump = require('gulp-bump');//increase version number
var gutil = require('gulp-util');


module.exports = function (gulp) {



gulp.task('set-version', function (cb) {


//bump to next version, or set version explicitly, depending on which options are passed.
    if (argv.b) {


        // argv.b will supply what kind of version change type  we are releasing 'patch' 'major' or 'minor'

        return  gulp.src([project_package_dir + 'bower.json', project_package_dir + 'package.json'])
                .pipe(bump({type: argv.b}).on('error', gutil.log))
                .pipe(gulp.dest(project_package_dir));

    } else {

        if (argv.n) {


            module.exports.setVersion(argv.n, function (err) {
                if (err)
                    throw err;
                cb()

            });

        }
    }
    cb();

});
};


/**
 * Set Project Version
 *
 * Updates Version Number in the package.json configuration of the release project
 * @param string version The version number to write to package.json
 * @return void
 */

module.exports.setVersion=function (version, cb) {

    var packagejson = JSON.parse(fs.readFileSync( project_package_dir + 'package.json', 'utf8'));



    if (typeof argv.n === 'boolean') {
        throw new Error("Please supply a version number to set version.");
    }


    packagejson['version'] = version;

    fs.writeFileSync(project_package_dir + 'package.json', JSON.stringify(packagejson, null, 2, function (err) {

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
module.exports.getPackage=function () {
    if (fs.existsSync(project_package_dir + 'package.json')) {
        return JSON.parse(fs.readFileSync(project_package_dir + 'package.json', 'utf8'));
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
module.exports.getGitHubUserName=function () {


    try {
        return ghparse(module.exports.getProjectPackage().repository.url)['0'];
    } catch (e) {
        return "";
    }

}


/**
 * Get GitHub Repo Name
 *
 * Parses the project's repository url to get its repo name
 * ref: https://www.npmjs.com/package/parse-github-repo-url
 * @param void
 * @return string The GitHub repo
 */
module.exports.getGitHubRepoName=function () {


    try {
        return ghparse(module.exports.getProjectPackage().repository.url)['1'];
    } catch (e) {
        return "";
    }





}


/**
 * Get Project Version
 *
 * @param void
 * @return string The version in the package file
 */
module.exports.getGitHubRepoName=function () {
    // We parse the json file instead of using require because require caches
    // multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync(project_package_dir + 'package.json', 'utf8')).version;
}




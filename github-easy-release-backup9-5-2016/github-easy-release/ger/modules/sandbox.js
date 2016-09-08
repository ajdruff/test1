
var fs = require('fs'); //file system library
var package_dir = __dirname + "/../../"; //point to directory containing package.json
var project_package_dir = __dirname + "/../../../"; //point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander


module.exports = function (gulp) {
    gulp.task('test-api', function (cb) {

        getAllGitHubReleases
                (
                        getGitHubRepoName(), //repo
                        getGitHubUserName(), //username
                        function (releases) {

                            // console.log(releases)

                            for (release in releases) {
                                release = releases[release];
                                console.log(release.tag_name + ' : ' + release.id);
                            }

                        }
                )



        return;
        return git.checkout('master', function (err) {
            if (err)
                throw err;
            cb();
        });
    });

gulp.task('ger-sandbox', function (callback) {
    runSequence(
            'troubleshooting',
            function (error) {
                if (error) {
                    console.log(error.message);
                } else {
                    // console.log('RELEASE ' + getProjectVersion() + ' FINISHED SUCCESSFULLY');
                }
                callback(error);
            });
});


    gulp.task('troubleshooting', function (cb) {





        execCmd(
                "git tag -d " + tag,
                {},
                function (err, stdout, stderr) {
                    if (err) {
                        throw err;
                    }
                    if (stderr) {
                        console.log('Could not delete local tag:' + stderr);
                        return cb();
                    }
                    console.log(stdout);
                    return cb();
                });


        return;

    });



};




module.exports.NAME = function () {

}

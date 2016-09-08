
var fs = require('fs'); //file system library
var package_dir = __dirname + "/../../"; //point to directory containing package.json
var project_package_dir = __dirname + "/../../../"; //point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander


module.exports = function (gulp) {

    gulp.task('updateGhPages', function (callback) {

        //if ghpages false, but argv.p, then do it
        if (!argv.p) {
            ghpages = getConfig().ghpages;
        }
        if (argv.p) {
            ghpages = true;
        }
        if (!(ghpages)) {
            console.log("Skipping gh-pages update per package.json{config:{ghpages} setting");
            callback();
            return;
        }

        runSequence(
                'checkout-master',
                'convert-readme-to-html',
                'fetch',
                'checkout-ghpages',
                'copy-converted-readme-to-gh-pages-branch',
                'commit-gh-pages',
                'push-gh-pages',
                'checkout-master',
                function (error) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log('GitHub Pages updated successfully.');
                    }
                    callback(error);
                });
    });
};





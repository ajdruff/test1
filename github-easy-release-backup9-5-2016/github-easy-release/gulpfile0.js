var gulp = require('gulp');
var runSequence = require('run-sequence');//force synchronous execution
var conventionalChangelog = require('gulp-conventional-changelog');//update changelog

var bump = require('gulp-bump');//increase version number
var gutil = require('gulp-util')
var git = require('gulp-git');//git
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander
var marked = require('marked'); //markdown library
var fs = require("fs");//file system library
var liquid = require("gulp-liquid");// stream replace
var rename = require("gulp-rename");//stream rename


var ghparse = require('parse-github-repo-url') //extract github info from repo url
var githubAPI = require('octonode');//github api node library
var urlparser = require('url');//parser
var sprintf = require("sprintf-js").sprintf; //formatting
var chalk = require('chalk');//console text style formatting
var moment = require("moment");//time stamp
var exec = require('child_process').exec; //command line execution
var prompt = require("prompt");//prompt



var
        requireFrom = require('requirefrom')
        , modules = requireFrom('ger/modules/')
        , gerpackage = modules('package.js')
        , help = modules('help.js')
        , projectpackage = modules('projectpackage.js')
        , token = modules('token.js')
        , template = modules('template.js')
        , sandbox = modules('sandbox.js')
        
        
        
//tasks

modules('package.js')(gulp);//expose gulp tasks
modules('help.js')(gulp);//expose gulp tasks
modules('projectpackage.js')(gulp);//expose gulp tasks
modules('template.js')(gulp);//expose gulp tasks

modules('sandbox.js')(gulp);//expose gulp tasks

gulp.task('test', function () {





});






gulp.task('changelog', function () {


    var config = getGerPackage().config;

    return gulp.src(getConfig().changelog, {
        buffer: false
    })
            .pipe(conventionalChangelog({
                preset: 'angular',
                releaseCount: 0 // Or to any other commit message convention you use.
            }))
            .pipe(gulp.dest(__dirname + '/'));
});






gulp.task('convert-readme-to-html', function () {
    if (fs.existsSync("../" + getConfig().readme)) {
        var fileContent = fs.readFileSync("../" + getConfig().readme, "utf8");
    } else {

        throw new Error('Cannot find the ' + getConfig().readme + ". To fix this, set the package.json `readme` setting to the name of your readme file.")
    }


    marked.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false
    });


    fileContent = marked(fileContent);

    return gulp.src(__dirname + '/gh-pages/_layouts/index.html')
            .pipe(liquid({
                locals: {
                    CONTENT: fileContent.toString(),
                    GITHUB_REPO: getGitHubRepoName(),
                    GITHUB_USERNAME: getGitHubUserName(),
                    VERSION_NUMBER: getProjectVersion()
                }
            }))


            .pipe(rename('readme.html'))
            .on('end', function () {
                //console.log('replaced liquid tags')
            })
            .pipe(gulp.dest(__dirname + '/gh-pages/cache'));
});






















/*
 * GitHub API Create Release
 */
gulp.task('github-release', function (cb) {

//build a client from a token
    var client = githubAPI.client(
            token.token.getGitHubToken()
            );

    var ghrepo = client.repo(
            getGitHubUserName() + '/' + getGitHubRepoName() // e.g.: 'ajdruff/projectname'
            );

    var now = moment();



    var template = getConfig().release_note;
    var default_template = "released {NOW}";

    //use default template if the provided template is empty
    if (template.trim() === "") {
        template = default_template;
    }


    var body = renderTemplate(template);
    var options =
            {
                "tag_name": getTag(),
                "target_commitish": "master",
                "name": getTag(),
                "body": body,
                "draft": false,
                "prerelease": (argv.b === "prerelease")
            }
    ;
    ghrepo.release(options, function (err, data, headers) {


        if (err) {
            console.log(options);
            console.log(err);
            throw err;
        }
        cb();

    });



});




gulp.task('commit-master', function (cb) {




    var q = require('bluebird'); //need promises since commit doesnt normally return stream. see https://github.com/stevelacy/gulp-git/issues/49
    return new q(function (resolve, reject) {

        var commit_message = renderTemplate(getConfig().commit_message);
        //copy index.html to gh-pages
        gulp.src('../')
                .pipe(git.add())
                .pipe(stream = git.commit(commit_message)).on('error', function (e) {
            console.log('No changes to commit');
        })

                .on('error', resolve) //resolve to allow the commit to resume even when there are not changes.
                .on('end', resolve);



        stream.resume(); //needed since commmit doesnt return stream by design.


        ;







    });

});

gulp.task('push-master', function (cb) {

    return git.push('origin', 'master', {args: '--tags'}, function (err) {

        if (err)
            throw err;
        cb();

    });


});


gulp.task('push-gh-pages', function (cb) {
    git.push('origin', 'gh-pages', cb);


});




gulp.task('commit-gh-pages', function (cb) {


    var q = require('bluebird'); //need promises since commit doesnt normally return stream. see https://github.com/stevelacy/gulp-git/issues/49
    return new q(function (resolve, reject) {


        //copy index.html to gh-pages
        gulp.src('../index.html')
                .pipe(stream = git.commit('updated gh-pages readme ')).on('error', function (e) {
            console.log('No changes to commit');
        })

                .on('error', resolve) //resolve to allow the commit to resume even when there are not changes.
                .on('end', resolve);



        stream.resume(); //needed since commmit doesnt return stream by design.


        ;







    });

});

gulp.task('copy-converted-readme-to-gh-pages-branch', function (cb) {

    //copy index.html to gh-pages
    return gulp.src(__dirname + '/gh-pages/cache/readme.html')
            .pipe(rename("index.html"))
            .pipe(gulp.dest('../'), function (err) {
                if (err)
                    throw err;



            })

            .pipe(git.add(), function (err) {
                if (err)
                    throw err;



            });


});

gulp.task('checkout-ghpages', function (cb) {


    return git.checkout('gh-pages', function (err) {
        if (err)
            throw err;
        cb();
    });

});

gulp.task('checkout-master', function (cb) {

    return git.checkout('master', function (err) {
        if (err)
            throw err;
        cb();
    });
});

gulp.task('fetch', function (cb) {

    git.fetch('origin', '', {}, function (err) {
        if (err)
            throw err;
        cb();
    });

});

gulp.task('push-gh-pages-changes', function (cb) {
    git.push('origin', 'gh-pages', cb);

});








/**
 * Get Unpublished GitHub Release
 * Given a tag,searches for its release ( includes unpublished releases, unlike the API's Get Release By Tag endpoint)
 * 
 * @param callback function Callback function
 * @return void
 */

function getGitHubUnpublishedRelease(repo, username, tag, callback) {
    var result = {
        "release": null,
        "found": false
    }
    var total_item_count = 0;


    var repo = getGitHubRepoName();
    var username = getGitHubUserName();
    var endpoint = '/repos/' + username + '/' + repo + '/releases';

    //Grab a page of releases at a time
    getAllGitHubItems(
            endpoint,
            repo, //repo
            username, //github username
            pageCallback, //will be called for each page of items returned
            finalCallback //will be called when the last page has been processed.

            );


    //delete each item when a page is returned from the API
    function pageCallback(
            err,
            releases,
            gitHubItemsCallback //callback to getAllGitHubItems each time a page is processed.
            ) {
        var page_item_count = 0;//number of items on the page. needs to reset with each call    


        for (release in releases) {
            total_item_count++;  //keep track of how many items were processed.



            release = releases[release];



            //if the release's tag is the one we are looking for,we're done. 
            if (release.tag_name === tag && release.draft) {
                result.release = release;
                result.found = true;
                gitHubItemsCallback(err, result);
                return;
            }





        }


    }

    //just return to the calling task
    function finalCallback(err, result) {

        return callback(err, result);
    }



}
/**
 * List All GitHub Releases
 * This will list all GitHub releases for project to console
 * 
 * @param callback function Callback function
 * @return void
 */

function listAllGitHubReleases(callback) {
    var result = {
        "total": 0
    }
    var total_item_count = 0;


    var repo = getGitHubRepoName();
    var username = getGitHubUserName();
    var endpoint = '/repos/' + username + '/' + repo + '/releases';

    //Grab a page of releases at a time
    getAllGitHubItems(
            endpoint,
            repo, //repo
            username, //github username
            pageCallback, //will be called for each page of items returned
            finalCallback //will be called when the last page has been processed.

            );


    //delete each item when a page is returned from the API
    function pageCallback(
            err,
            releases,
            gitHubItemsCallback //callback to getAllGitHubItems each time a page is processed.
            ) {
        var page_item_count = 0;//number of items on the page. needs to reset with each call    


        for (release in releases) {
            total_item_count++;  //keep track of how many items were processed.



            release = releases[release];

            printRelease(release, function () {
                page_item_count++;
                if (releases.length === page_item_count) {
                    result.total = total_item_count;
                    gitHubItemsCallback(err, result);
                }

            }
            );







        }


    }

    //just return to the calling task
    function finalCallback(err, result) {

        return callback(err, result);
    }



}





/**
 * Print Release
 *
 * Prints a release object's properties to the console.
 
 * @param release jsonObject The release object returned by the GitHub API
 * @return void
 */




function printRelease(release, callback) {

    if (argv.a) {
        console.log(release);
    } else {


        //   release = releases[release];

        console.log("Tag: " + release.tag_name);
        console.log("Url: " + release.url);
        console.log("Description: " + release.body.trim())
        console.log("Pre-release: " + release.prerelease)
        console.log("Draft: " + release.draft)
        console.log("------------------------")
    }
    if (callback)
        callback();
}

/**
 * List Releases (Task)
 *
 * Prints all releases to the console
 */

gulp.task('ger-list-releases', function (cb) {

    listAllGitHubReleases(
            function (err, result) {
                console.log('Total of ' + result.total + ' releases.');
                return cb()
            }
    );






});
/**
 * List Release (Task)
 *
 * Args: -t string tagname
 * Given the tag for a release, prints it to the screen
 */

gulp.task('ger-list-release', function (cb) {

    if (!argv.t) {
        console.log("No tag to list! Specify tag to list with the -t option. `gulp ger` for help ");
        return cb();
    }

    if (argv.t) {
        getGitHubRelease
                (
                        getGitHubRepoName(), //repo
                        getGitHubUserName(), //username
                        argv.t, //tag
                        function (release) {
                            if (!release) {
                                console.log("Release for " + argv.t + " doesn't exist");
                                return cb();

                            }


                            printRelease(release);

                            return cb();

                        }
                )

    }






});


/**
 * Delete All GitHub Releases
 * This will delete all releases on GitHub.
 * 
 * @param dryrun boolean Set to false to delete
 * @param callback function Callback function
 * @return void
 */

function deleteAllGitHubReleases(dryrun, callback) {
    var result = {
        "total": 0
    }
    var total_item_count = 0;
    if (typeof (dryrun) === 'undefined') {
        dryrun = false;
    }


    var username = getGitHubUserName();
    var repo = getGitHubRepoName();
    var endpoint = '/repos/' + username + '/' + repo + '/releases';

    //Grab a page of releases at a time
    getAllGitHubItems(
            endpoint,
            repo, //repo
            username, //github username
            pageCallback, //will be called for each page of items returned
            finalCallback //will be called when the last page has been processed.

            );


    //delete each item when a page is returned from the API
    function pageCallback(
            err,
            releases,
            gitHubItemsCallback //callback to getAllGitHubItems each time a page is processed.
            ) {
        var page_item_count = 0;//number of items on the page. needs to reset with each call    


        for (release in releases) {
            total_item_count++;  //keep track of how many items were processed.



            release = releases[release];



            deleteGitHubReleaseByTag
                    (
                            getGitHubRepoName(), //repo
                            getGitHubUserName(), //username
                            release.tag_name,
                            function () {
                                page_item_count++;
                                if (releases.length === page_item_count) {
                                    result.total = total_item_count;
                                    gitHubItemsCallback(err, result);
                                }

                            }

                    )





        }


    }

    //just return to the calling task
    function finalCallback(err, result) {

        return callback(err, result);
    }



}


/**
 * Delete All Releases
 *
 */

gulp.task('ger-delete-all-releases', function (cbTask) {

    var dryrun = (argv.d);


    options = {
        prompt_message: "Do you really want to delete all releases [y/n]?",
        default_answer: "n"
    }

    promptYesNo(options, function (yes) {

        if (yes) {
            deleteAllGitHubReleases(
                    dryrun //dryrun
                    , function (err, result) {
                        console.log('Completed deleting releases. ' + result.total + ' releases deleted.');
                        return cbTask()
                    }
            );
        } else {

            console.log('Delete cancelled, no releases were deleted');
            return cbTask();
        }


    });









});




/**
 * Delete Release
 *
 * Delete release specified with -r option.
 */

gulp.task('ger-delete-release', function (cb) {
    if (!argv.t) {

        console.log("No release to delete! Specify release to be deleted with the -t option. `gulp ger` for help ");
        return cb();

    }
    var tag = argv.t;
    options = {
        prompt_message: "Do you really want to delete release " + tag + " [y/n]?",
        default_answer: "n"
    }

    promptYesNo(options, function (yes) {

        if (yes) {
            deleteGitHubReleaseByTag
                    (
                            getGitHubRepoName(), //repo
                            getGitHubUserName(), //username
                            argv.t //tag

                            )
        } else {

            console.log('Delete cancelled.');

        }
        return cb();

    });


});










/**
 * Check Release Type
 *
 * Checks validity of -b option
 * @param void
 * @return boolean The result of the check
 */

function checkReleaseType() {
    if (argv.b) {
        //check version type
        var allowed_types = ["major", "minor", "patch", "prerelease"];
        var type = allowed_types.indexOf(argv.b);
        if (type == -1) {


            return false;
        }

    }
    return true;


}

gulp.task('release', function (callback) {
    //check for release option
    if (!argv.b && !argv.n) {
        console.log("Skipping release.");
        callback();
        return;
    }


    if (!checkReleaseType()) {
        console.log(chalk.red(("Missing or invalid release type. Cannot continue with release.")));
        callback();
        return;
    }

    runSequence(
            'checkout-master',
            'set-version',
            'changelog',
            'commit-master',
            'create-tag',
            'push-master',
            'github-release',
            function (error) {
                callback(error);
            });
});





gulp.task('ger', function (callback) {
    //display help if no options provided
    if (Object.keys(argv).length === 1) {
        showDefaultHelp();

        callback();
        return;
    }


//if release or update pages.
    if (argv.p || argv.b || argv.n) {

        runSequence(
                'release',
                'updateGhPages',
                function (error) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log('RELEASE ' + getProjectVersion() + ' completed successfully.');
                    }
                    callback(error);
                });
        return;
    }

//configuration
    if (argv.c) {
        gerpackage.setPackageConfig();
        callback();
        return;
    }

    if (!argv.n && argv.t) {
        console.log('You must specify a version with -n if you specify  -t tag');
        callback();
        return;
    }

    console.log('Invalid options. See ger-help for valid options and examples.');
    callback();

});



/*
 * Alias Tasks
 * 
 * 
 */

gulp.task('ger-major', function (callback) {
    if (argv.n) {
        console.log("-n won't work with this task, try ger -n instead ");//this is because aliases always set -b and -b overrides -n
        callback();
        return;
    }

    argv.b = "major";
    gulp.start('ger');
    callback();
    return;

});

gulp.task('ger-minor', function (callback) {

    if (argv.n) {
        console.log("-n won't work with this task, try ger -n instead ");//this is because aliases always set -b and -b overrides -n
        callback();
        return;
    }

    argv.b = "minor";
    gulp.start('ger');
    callback();
    return;

});


gulp.task('ger-patch', function (callback) {

    if (argv.n) {
        console.log("-n won't work with this task, try ger -n instead ");//this is because aliases always set -b and -b overrides -n
        callback();
        return;
    }


    argv.b = "patch";
    gulp.start('ger');
    callback();
    return;

});

gulp.task('ger-prerelease', function (callback) {

    if (argv.n) {
        console.log("-n won't work with this task, try ger -n instead ");//this is because aliases always set -b and -b overrides -n
        callback();
        return;
    }

    argv.b = "prerelease";
    gulp.start('ger');
    callback();
    return;
});




/**
 * Get GitHub Release
 *
 *  Returns release a object if available otherwise returns false.
 * @param string repo Git repo name
 * @param string username Git repo username
 * @param string tag of release
 * @param function callback
 * @return object Release object or false if not found.
 */


function getGitHubRelease(repo, username, tag, callback) {


    var client = githubAPI.client(
            token.token.getGitHubToken()
            );
    var endpoint = '/repos/' + username + '/' + repo + '/releases/tags/' + tag;

    client.get(
            endpoint,
            {},
            function (err, status, release, headers) {
                if (err) { //it will err out if it cant find it as a published release, so we'll search unpublished (Draft)
                    getGitHubUnpublishedRelease(repo, username, tag,
                            function (err, result) {
                                if (result.found) {
                                    return callback(result.release);
                                } else {
                                    return callback(false);
                                }



                            }
                    )

                }
                return callback(release);

            });


}






/**
 * Delete GitHub Release by Tag
 *
 * Deletes GitHub Release and local and remote tag
 * 
 * @param string tag of release
 * @return void
 */

function deleteGitHubReleaseByTag(repo, username, tag, deleteByTagCallback) {

//first get the release from its tag, then delete it.
//this is because the delete api endpoint requires knowing the release.id


    //get id from tag & delete it in the callback
    getGitHubRelease(
            repo, //repo,
            username, //username
            tag, //tag
            function (release) {

                // console.log('release = ' + release + ' is type ' + typeof (release))
                if (!release) {
                    console.log("release for tag " + tag + " does not exist")
                    deleteTag(tag, function (result) {
                        console.log(result.local_message);
                        console.log(result.remote_message);

                    });
                } else {

                    deleteGitHubRelease(release, function (status) {
                        if (status === "Not Found") {
                            console.log("No release exists with tag " + release.tag_name);
                        } else {

                            console.log("Successfully Deleted release with tag " + release.tag_name);
                            deleteByTagCallback();

                        }


                    });
                }
            }
    );



    return;

}

/**
 * Delete a GitHub Release
 *
 * Uses the GitHub API to delete a GitHub Release
 * 
 * @param object Release object provided by github api  https://developer.github.com/v3/repos/releases/#get-a-release-by-tag-name
 * @param callback "Not Found" , "Invalid"
 * @return void;
 */


function deleteGitHubRelease(release, cb) {
    var dryrun = argv.d;

    if (typeof (release) === 'undefined' || typeof (release.tag_name) === 'undefined') {
        cb('Not Found');
        return;
    }





    //delete release on GitHub
    var client = githubAPI.client(
            token.getGitHubToken()
            );
    var endpoint = urlparser.parse(release.url).pathname; //e.g.: /repos/ajdruff/test1/releases/3899967'


    if (dryrun) {


        clientDelDryRun(
                endpoint,
                {},
                function (err) {

                    if (err) {
                        cb('Not Found');
                    } else {


                        //delete tag
                        deleteTagDryRun(release.tag_name, function (result) {


                            console.log("dryrun " + result.local_message);
                            console.log("dryrun " + result.remote_message);

                            cb('success');

                        });

                    }

                });
    } else {
        client.del(
                endpoint,
                {},
                function (err) {

                    if (err) {
                        cb('Not Found');
                    } else {


                        //delete tag
                        deleteTag(release.tag_name, function (result) {


                            console.log(result.local_message);
                            console.log(result.remote_message);

                            cb('success');

                        });

                    }

                });
    }

}



/**
 * Short Description
 *
 * Long
 * @package MintForms
 * @since 0.1.1
 * @uses
 * @param string $content The shortcode content
 * @return string The parsed output of the form body tag
 */

function clientDelDryRun(endpoint, obj, callback) {
    callback();
}

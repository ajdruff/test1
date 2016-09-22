
var path = require("path")
var ger_dir = path.join(__dirname, '../../');//point to directory containing package.json
var project_dir = path.join(__dirname, '../../../');//point to directory containing package.json



var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander
var git = require('gulp-git');//git
var gulp = require('gulp');//gulp
var github_api = require('octonode');//github api node library 
//
//
//private modules
var prompt = require("./prompt.js"),
        exec = require("./exec.js")  //to include another private module
template_mod = require("./template.js")  //to include another private module
package = require("./package.js")  //to include another private module     
github_items = require("./gh-items.js")(argv)  //to include another private module   
project = require("./project.js")  //to include another private module   
token = require("./token.js")  //to include another private module  


module.exports = function (gulp) {







    gulp.task('create-tag', function (cb) {

        module.exports.createTag(function () {
            return cb();
        });







    });

    /**
     * List Tags (Task)
     *
     * Prints all tags to the console
     */

    gulp.task('ger-list-tags', function (cbTask) {

        module.exports.listAllGitHubTags(
                function (err, result) {

                    if (err) {
                        console.log(err.message);
                        return cbTask();
                    }
                    console.log('Total of ' + result.total + ' tags.');
                    return cbTask()
                }
        );






    });



    /**
     * Delete All Tags
     *
     */

    gulp.task('ger-delete-all-tags', function (cbTask) {

        var dryrun = false;
        if (argv.d) {
            dryrun = true;
        }
        options = {
            prompt_message: "Do you really want to delete all tags [y/n]?",
            default_answer: "n"
        }

        prompt.promptYesNo(options, function (yes) {

            if (yes) {
                module.exports.deleteAllGitHubTags(
                        dryrun //dryrun
                        , function (err, result) {
                            if (err) {
                                console.log(err.message);
                                return cbTask();
                            }
                            console.log('Deleted a total of ' + result.total + ' tags.');
                            return cbTask()
                        }
                );
            } else {

                console.log('Delete cancelled, no tags were deleted');
                return cbTask();
            }


        });









    });

    /**
     * Delete Tag
     *
     */

    gulp.task('ger-delete-tag', function (cb) {

        if (!argv.t) {

            console.log("No tag to delete! Specify tag to be deleted with the -t option. `gulp ger` for help ");
            return cb();

        }

        var tag = argv.t;


        options = {
            prompt_message: "Do you really want to delete tag " + argv.t + " ? [y/n]",
            default_answer: "n",
        }

        prompt.promptYesNo(options, function (yes) {

            if (yes) {
                module.exports.deleteTag(argv.t, function (result) {
                    console.log(result.local_message);
                    console.log(result.remote_message);
                    return cb();

                });
            } else {

                console.log(tag + ' was not deleted');
                return cb();
            }


        });








    });


    /**
     * List Tag (Task)
     *
     * Args: -t string tagname
     * Prints a tag object's properties to the console   
     */

    gulp.task('ger-list-tag', function (cb) {

        if (!argv.t) {
            console.log("No tag to list! Specify tag to list with the -t option. `gulp ger` for help ");
            return cb();
        }

        if (argv.t) {

            console.log('Searching GitHub. This may take a while...');

            module.exports.getGitHubTag
                    (
                            project.getGitHubRepoName(), //repo
                            project.getGitHubUserName(), //username
                            argv.t, //tag
                            function (err, result) {
                                if (!result.found) {
                                    console.log("Tag for " + argv.t + " doesn't exist");
                                    return cb();

                                } else {
                                    //found, so print it.
                                    module.exports.printTag(result.tag, function () {
                                        return cb();

                                    });
                                }






                            }
                    )

        }






    });


};


/**
 * Create Tag
 *
 * Creates a tag using the -t option or the tag 
 * configured in the project's package.json file
 
 * @param function Callback
 */

module.exports.createTag = function (cb) {
    var tag = module.exports.getTag();
    var tag_message = template_mod.render(package.getConfig().tag_message);



    git.tag(tag, tag_message, function (err) {
        if (err) {

            throw err;
        }
        return cb();

    }


    );
}


/**
 * Get Tag
 *
 * Get the tag provided by options or from tag template
 * @param string $content The shortcode content
 * @return string The parsed output of the form body tag
 */

module.exports.getTag = function () {

    var tag;
    //use the tag from the tag option if provided
    if (argv.t) {
        tag = argv.t;
    } else {
        //use the tag_template to create the tag
        tag = template_mod.render(package.getConfig().tag);

    }

    return tag;
}


/**
 * Print Tag
 *
 * Prints a tag object's properties to the console.
 
 * @param tag jsonObject The tag object returned by the GitHub API
 * @return void
 */

module.exports.printTag = function (tag, callback) {

    if (argv.a) {
        console.log(tag);
    } else {




        console.log("Name: " + tag.name);
        console.log("Zipball: " + tag.zipball_url);
        console.log("Tarball: " + tag.tarball_url)
        console.log("SHA: " + tag.commit.sha)
        console.log("SHA URL: " + tag.commit.url)

        console.log("------------------------")
    }
    callback();
}



/**
 * List All GitHub Tags
 * 
 * Prints all the project's GitHub tags and their properties to the
 * console
 * 
 * @param callback function Callback function
 * @return void
 */
module.exports.listAllGitHubTags = function (callback) {
    var result = {
        "total": 0
    }
    var total_item_count = 0;


    var repo = project.getGitHubRepoName();
    var username = project.getGitHubUserName();
    var endpoint = '/repos/' + username + '/' + repo + '/tags';

    //Grab a page of releases at a time
    github_items.getAllGitHubItems(
            endpoint,
            repo, //repo
            username, //github username
            pageCallback, //will be called for each page of items returned
            finalCallback //will be called when the last page has been processed.

            );


    //delete each item when a page is returned from the API
    function pageCallback(
            err,
            tags,
            gitHubItemsCallback //callback to getAllGitHubItems each time a page is processed.
            ) {
        var page_item_count = 0;//number of items on the page. needs to reset with each call    


        for (tag in tags) {
            total_item_count++;  //keep track of how many items were processed.



            tag = tags[tag];

            module.exports.printTag(tag, function () {
                page_item_count++;
                if (tags.length === page_item_count) {
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
 * Delete All GitHub Tags
 * This will delete all tags on GitHub.
 * 
 * @param dryrun boolean Set to false to delete
 * @param callback function Callback function
 * @return void
 */
module.exports.deleteAllGitHubTags = function (dryrun, callback) {
    var result = {
        "total": 0
    }

    var total_item_count = 0;
    if (typeof (dryrun) === 'undefined') {
        dryrun = false;
    }


    var username = project.getGitHubUserName();
    var repo = project.getGitHubRepoName();
    var endpoint = '/repos/' + username + '/' + repo + '/tags';

    //Grab a page of releases at a time
    github_items.getAllGitHubItems(
            endpoint,
            repo, //repo
            username, //github username
            pageCallback, //will be called for each page of items returned
            finalCallback //will be called when the last page has been processed.
                       ,10 //items per page
                        ,1 // page to start
                        ,0 //page increment. we set this to zero since we'll be deleting all items on a page as we go. so each request needs to be requesting page 1.
            );


    //delete each item when a page is returned from the API
    function pageCallback(
            err,
            tags,
            gitHubItemsCallback //callback to getAllGitHubItems each time a page is processed.
            ) {
        var page_item_count = 0;//number of items on the page. needs to reset with each call    


        for (tag in tags) {
            total_item_count++;  //keep track of how many items were processed.



            tag = tags[tag];

            if (dryrun) {
                module.exports.deleteTagDryRun(tag.name,
                        function (result) {
                            page_item_count++;

                            console.log("(dryrun)" + result.local_message);
                            console.log("(dryrun)" + result.remote_message);

                            if (tags.length === page_item_count) { //if reached end of page.


                                result.total = total_item_count;
                                return gitHubItemsCallback(err, result);
                            }

                        }
                )
            }
            if (!dryrun)
            {

                module.exports.deleteTag(tag.name,
                        function (result) {
                            page_item_count++;
                            console.log(result.local_message);
                            console.log(result.remote_message);
                            if (tags.length === page_item_count) { //if reached end of page, return to gitHubItems to call the next page


                                result.total = total_item_count;
                                return gitHubItemsCallback(err, result);
                            }

                        }
                );


            }




        }


    }

    //just return to the calling task
    function finalCallback(err, result) {

        return callback(err, result);
    }



}


/**
 * Get GitHub Tag
 *
 *  Returns tag a object if available otherwise returns false.
 * @param string repo Git repo name
 * @param string username Git repo username
 * @param string tag of release
 * @param function callback
 * @return object Release object or false if not found.
 */



/**
 * Get Unpublished GitHub Release
 * Given a tag,searches for its release ( includes unpublished releases, unlike the API's Get Release By Tag endpoint)
 * 
 * @param callback function Callback function
 * @return void
 */
module.exports.getGitHubTag = function (repo, username, tag_name, callback) {
    var result = {
        "tag": null,
        "found": false
    }
    var total_item_count = 0;


    var repo = project.getGitHubRepoName();
    var username = project.getGitHubUserName();
    var endpoint = '/repos/' + username + '/' + repo + '/tags';

    //Grab a page of releases at a time
    github_items.getAllGitHubItems(
            endpoint,
            repo, //repo
            username, //github username
            pageCallback, //will be called for each page of items returned
            finalCallback //will be called when the last page has been processed.

            );


    //delete each item when a page is returned from the API
    function pageCallback(
            err,
            tags,
            gitHubItemsCallback //callback to getAllGitHubItems each time a page is processed.
            ) {
        var page_item_count = 0;//number of items on the page. needs to reset with each call    


        for (var tag in tags) {
            total_item_count++;  //keep track of how many items were processed.



            tag = tags[tag];



            //if the release's tag is the one we are looking for,we're done. 
            if (tag.name === tag_name) {


                result.tag = tag;
                result.found = true;
                return gitHubItemsCallback(err, result);

            }





        }
        return gitHubItemsCallback(err, result);

    }

    //just return to the calling task
    function finalCallback(err, result) {

        return callback(err, result);
    }



}

module.exports.getGitHubTagOld = function (repo, username, tag, callback) {

    var client = github_api.client(
            token.getGitHubToken()
            );



    var endpoint = '/repos/' + username + '/' + repo + '/tags/tag/' + tag;

    client.get(
            endpoint,
            {},
            function (err, status, body, headers) {
                console.log(headers);
                if (err) {
                    throw err;
                }
                console.log(headers);
                return;
            });


}



/**
 * Delete Tag
 *
 * Delete local and remote tag
 * @param tag Release tag name
 * @param callback function Callback
 * 
 * @return void
 */

module.exports.deleteTag = function (tag, deleteTagCallback) {

    //delete local tag

    var result = {
        "remote_success": false,
        "remote_message": "",
        "local_success": false,
        "local_message": ""

    };
    var deleteRemoteTag = function (tag, local_result, remoteTagCallback) {
//need to check for 'warning'. normal stderr or err check doesnt work.

        var remote_result = local_result;
        exec.execCmd(
                "git push origin :refs/tags/" + tag,
                {},
                function (err, stdout, stderr) {

                    if ((err) || stderr.indexOf("warning") !== -1) {
                        remote_result.remote_success = false;
                        remote_result.remote_message = ('Could not delete remote tag:' + stderr);
                        remoteTagCallback(remote_result);

                    } else {

                        remote_result.remote_success = true;
                        remote_result.remote_message = ('Remote tag ' + tag + ' successfully deleted.');

                        remoteTagCallback(remote_result);
                    }

                });
    }




//delete local tag first
//then delete remote tag.

    exec.execCmd(
            "git tag -d " + tag,
            {},
            function (err, stdout, stderr) {

                var local_result = {
                    "remote_success": false,
                    "remote_message": "",
                    "local_success": false,
                    "local_message": ""

                };
                if (err) {

                    local_result.local_success = false;
                    local_result.local_message = ('Could not delete local tag:' + stderr);

                } else {

                    local_result.local_success = true;
                    local_result.local_message = ('Local tag ' + tag + ' successfully deleted.');

                }
                deleteRemoteTag(tag, local_result, function (remote_result) {
                    var final_result = remote_result;
                    deleteTagCallback(final_result);



                });
            });









}
module.exports.deleteTagDryRun = function (tag, deleteTagCallback) {

    //delete local tag

    var result = {
        "remote_success": true,
        "remote_message": ('Remote tag ' + tag + ' successfully deleted.'),
        "local_success": true,
        "local_message": ('Local tag ' + tag + ' successfully deleted.')

    };
    deleteTagCallback(result);





}
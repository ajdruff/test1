


/**
 * Get Unpublished GitHub Release
 * Given a tag,searches for a draft release. If you want to search for all releases, use getGitHubRelease (its faster).
 * 
 * @param callback function Callback function
 * @return void
 */
module.exports = function (gulp, argv, project_dir, ger_dir){




    var github_api = require('octonode');//github api node library github_api
    var urlparser = require('url');//parser
    var
            requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')


            , project = modules('project.js')(gulp, argv, project_dir, ger_dir)

            , tag_mod = modules('tag.js')(gulp, argv, project_dir, ger_dir)

            , github_items = modules('gh-items.js')(gulp, argv, project_dir, ger_dir)



    module.getGitHubUnpublishedRelease = function (repo, username, tag, callback) {

        var result = {
            "release": null,
            "found": false
        }
        var total_item_count = 0;


        var repo = project.getGitHubRepoName();
        var username = project.getGitHubUserName();
        var endpoint = '/repos/' + username + '/' + repo + '/releases';

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
                    return gitHubItemsCallback(err, result);

                }




            }
            if (!result.found) {
                err = new Error("Not Found");
            }
            return gitHubItemsCallback(err, result);



        }

        //just return to the calling task
        function finalCallback(err, result) {

            return callback(err, result);
        }



    }
    /**
     * List All GitHub Releases
     * This will list all GitHub releases for project to console
     * @param options object Options
     * //options.published boolean show published
     * //options.draft boolean show draft
     * @param callback function Callback function
     * @return void
     */
    module.listAllGitHubReleases = function (options, callback) {
        var default_options = {
            "published": true,
            "draft": true

        }
// (options)
        if (typeof (options) !== 'function' && !callback) {
            callback = function () {};
        }
        // (callback)
        if (typeof (options) === 'function' && !callback) {
            callback = options;
            options = default_options;

        }



        var result = {
            "total": 0
            , "found": 0
        }
        var total_item_count = 0;
        var found_item_count = 0;


        var repo = project.getGitHubRepoName();
        var username = project.getGitHubUserName();
        var endpoint = '/repos/' + username + '/' + repo + '/releases';

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
                releases,
                gitHubItemsCallback //callback to getAllGitHubItems each time a page is processed.
                ) {
            var page_item_count = 0;//number of items on the page. needs to reset with each call    


            for (release in releases) {
                total_item_count++;  //keep track of how many items were processed.



                release = releases[release];
//filter - don't show draft if  all we want to see is published
                if (release.draft && !options.draft) {
                    page_item_count++;
                    //     console.log("skipping draft");
                    if (releases.length === page_item_count) {
                        result.total = total_item_count;
                        result.found = found_item_count;
                        gitHubItemsCallback(err, result);

                    }
                    continue;
                }
                if (!release.draft && !options.published) {
                    page_item_count++;
                    //  console.log("skipping published");
                    if (releases.length === page_item_count) {
                        result.total = total_item_count;
                        result.found = found_item_count;
                        gitHubItemsCallback(err, result);
                    }
                    continue;
                }
                module.printRelease(release, function () {
                    page_item_count++;
                    found_item_count++;
                    if (releases.length === page_item_count) {
                        result.total = total_item_count;
                        result.found = found_item_count;
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



    module.printRelease = function (release, callback) {


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
     * Delete All GitHub Releases
     * This will delete all releases on GitHub.
     * 
     * @param dryrun boolean Set to false to delete
     * @param callback function Callback function
     * @return void
     */
    module.deleteAllGitHubReleases = function (dryrun, callback) {

        var result = {
            "total": 0
        }
        var total_item_count = 0;
        if (typeof (dryrun) === 'undefined') {
            dryrun = false;
        }


        var username = project.getGitHubUserName();
        var repo = project.getGitHubRepoName();
        var endpoint = '/repos/' + username + '/' + repo + '/releases';

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
                releases,
                gitHubItemsCallback //callback to getAllGitHubItems each time a page is processed.
                ) {
            var page_item_count = 0;//number of items on the page. needs to reset with each call    


            for (release in releases) {
                total_item_count++;  //keep track of how many items were processed.



                release = releases[release];



                module.deleteGitHubReleaseByTag
                        (
                                project.getGitHubRepoName(), //repo
                                project.getGitHubUserName(), //username
                                release.tag_name,
                                function (result) {
                                    var dryrun_text = "";
                                    var release = result.release;
                                    if (argv.d) {
                                        dryrun_text = "(dryrun)";
                                    }
                                    if (result.deleted) {
                                        console.log(dryrun_text + "Release for tag " + release.tag_name + " was successfully deleted.");

                                    } else {

                                        console.log(dryrun_text + "Release could not be deleted. ");
                                        if (result.error) {
                                            console.log(result.error.message)
                                        }



                                    }




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
     * Check Release Type
     *
     * Checks validity of -b option
     * @param void
     * @return boolean The result of the check
     */
    module.checkReleaseType = function () {

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

    module.getGitHubRelease = function (repo, username, tag, callback) {



        var client = github_api.client(
                token.getGitHubToken()
                );
        var endpoint = '/repos/' + username + '/' + repo + '/releases/tags/' + tag;

        client.get(
                endpoint,
                {},
                function (err, status, release, headers) {

                    if (err) { //it will err out if it cant find it as a published release, so we'll search unpublished (Draft)
                        module.getGitHubUnpublishedRelease(repo, username, tag,
                                function (err, result) {



                                    if (result.found) {
                                        return callback(err, result.release);
                                    } else {
                                        return callback(err, false);
                                    }



                                }
                        )

                    } else {

                        return callback(err, release);

                    }


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
    module.deleteGitHubReleaseByTag = function (repo, username, tag, deleteByTagCallback) {


//first get the release from its tag, then delete it.
//this is because the delete api endpoint requires knowing the release.id


        //get id from tag & delete it in the callback
        module.getGitHubRelease(
                repo, //repo,
                username, //username
                tag, //tag
                function (err, release) {


                    if (!release) {
                        console.log("release for tag " + tag + " does not exist")
                        tag_mod.deleteTag(tag, function (result) {
                            console.log(result.local_message);
                            console.log(result.remote_message);
                            result = {
                                "found": false,
                                "deleted": false,
                                "release": console,
                                "error": null,
                            }
                            return deleteByTagCallback(result);

                        });
                    } else {

                        module.deleteGitHubRelease(release, function (result) {


                            return deleteByTagCallback(result);


                        });
                    }
                }
        );





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

    module.deleteGitHubRelease = function (release, cb) {
        result = {
            "found": false,
            "deleted": false,
            "release": release,
            "error": null

        }


        var dryrun = argv.d;

        if (typeof (release) === 'undefined' || typeof (release.tag_name) === 'undefined') {
            return cb(result);

        }





        //delete release on GitHub
        var client = github_api.client(
                token.getGitHubToken()
                );
        var endpoint = urlparser.parse(release.url).pathname; //e.g.: /repos/ajdruff/test1/releases/3899967'


        if (dryrun) {


            module.clientDelDryRun(
                    endpoint,
                    {},
                    release,
                    function (result) {

                        if (!result.deleted) {
                            return cb(result);
                        } else {



                            //delete tag
                            tag_mod.deleteTagDryRun(release.tag_name, function (result) {


                                console.log("(dryrun) " + result.local_message);
                                console.log("(dryrun) " + result.remote_message);
                                result = {};
                                result = {
                                    "found": true,
                                    "deleted": true,
                                    "release": release,
                                    "error": null

                                }


                                return cb(result);

                            });

                        }

                    });
        } else {


            client.del(
                    endpoint,
                    {},
                    function (err) {

                        if (err) {

                            result = {};
                            result = {
                                "found": false,
                                "deleted": false,
                                "release": release,
                                "error": err

                            }
                            return cb(result);
                        } else {
                            result = {};
                            result = {
                                "found": true,
                                "deleted": true,
                                "release": release,
                                "error": null

                            }
                            if (release.draft) {
                                return cb(result); //stop here if the deletion was successful and is a draft. drafts do not have tags
                            }

                            //delete tag
                            tag_mod.deleteTag(release.tag_name, function (tag_result) {

                                if (!release.draft) {
                                    //console.log("This is a draft release. Draft releases don't normally have tags so it is expected that tag deletion will fail.");

                                    console.log(tag_result.local_message);
                                    console.log(tag_result.remote_message);

                                }

                                var result = {};
                                result = {
                                    "found": true,
                                    "deleted": true,
                                    "release": release,
                                    "error": null

                                }
                                return cb(result);

                            });

                        }

                    });
        }

    }



    /**
     * Client Delete Dry Run
     * 
     * Fake release delete. used for testing.
     */
    module.clientDelDryRun = function (endpoint, obj, release, callback) {

        result = {
            "release": release,
            "found": true,
            "deleted": true,
            "error": null

        }

        callback(result);
    }



    return module;

}
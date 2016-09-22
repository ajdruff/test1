
/**
 * Tag Module
 * tag.js
 * 
 * Tag functions
 * 
 */
module.exports = function (gulp, argv, project_dir, ger_dir) {


//public modules
    var path = require("path")
            , git = require('gulp-git')//git

//private modules

    var requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')

    var exec = modules("exec.js")  //to include another private module
            , template_mod = modules("template.js")(gulp, argv, project_dir, ger_dir)  //to include another private module
            , package = modules("package.js")(gulp, argv, project_dir, ger_dir)  //to include another private module     
            , github_items = modules("gh-items.js")(gulp, argv, project_dir, ger_dir) //to include another private module   
            , project = modules("project.js")(gulp, argv, project_dir, ger_dir)  //to include another private module   



    /**
     * Create Tag
     *
     * Creates a tag using the -t option or the tag 
     * configured in the project's package.json file
     
     * @param function Callback
     */

    module.createTag = function (cb) {
        var tag = module.getTag();
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

    module.getTag = function () {

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

    module.printTag = function (tag, callback) {

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
    module.listAllGitHubTags = function (callback) {
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

                module.printTag(tag, function () {
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
    module.deleteAllGitHubTags = function (dryrun, callback) {
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
                , 10 //items per page
                , 1 // page to start
                , 0 //page increment. we set this to zero since we'll be deleting all items on a page as we go. so each request needs to be requesting page 1.
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
                    module.deleteTagDryRun(tag.name,
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

                    module.deleteTag(tag.name,
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
    module.getGitHubTag = function (repo, username, tag_name, callback) {
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


    /**
     * Delete Tag
     *
     * Delete local and remote tag
     * @param tag Release tag name
     * @param callback function Callback
     * 
     * @return void
     */

    module.deleteTag = function (tag, deleteTagCallback) {

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
    module.deleteTagDryRun = function (tag, deleteTagCallback) {

        //delete local tag

        var result = {
            "remote_success": true,
            "remote_message": ('Remote tag ' + tag + ' successfully deleted.'),
            "local_success": true,
            "local_message": ('Local tag ' + tag + ' successfully deleted.')

        };
        deleteTagCallback(result);





    }


    return module;
}
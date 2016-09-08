
var fs = require('fs'); //file system library
var package_dir = __dirname + "/../../"; //point to directory containing package.json
var project_package_dir = __dirname + "/../../../"; //point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander


module.exports = function (gulp) {
    gulp.task('create-tag', function (cb) {


        var tag = getTag();
        var tag_message = renderTemplate(getConfig().tag_message);



        return git.tag(tag, tag_message, function (err) {
            if (err) {

                throw err;
            }
            cb();

        }


        );



    });



    /**
     * List Tags (Task)
     *
     * Prints all tags to the console
     */

    gulp.task('ger-list-tags', function (cb) {

        listAllGitHubTags(
                function (err, result) {
                    console.log('Total of ' + result.total + ' tags.');
                    return cb()
                }
        );






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
            getGitHubTag
                    (
                            getGitHubRepoName(), //repo
                            getGitHubUserName(), //username
                            argv.t, //tag
                            function (tag) {
                                if (!tag) {
                                    console.log("Tag for " + argv.t + " doesn't exist");
                                    return cb();

                                }


                                printTag(tag);

                                return cb();

                            }
                    )

        }






    });


};





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
        tag = renderTemplate(getConfig().tag);

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


    var repo = getGitHubRepoName();
    var username = getGitHubUserName();
    var endpoint = '/repos/' + username + '/' + repo + '/tags';

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
            tags,
            gitHubItemsCallback //callback to getAllGitHubItems each time a page is processed.
            ) {
        var page_item_count = 0;//number of items on the page. needs to reset with each call    


        for (tag in tags) {
            total_item_count++;  //keep track of how many items were processed.



            tag = tags[tag];

            printTag(tag, function () {
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

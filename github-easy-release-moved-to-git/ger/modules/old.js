
/**
 * Get Unpublished Release
 *
 * Returns a release that is unpublished (draft=true). This is necessary since
 * the api to get a release by tag doesnt work with unpublished releases.
 * So we have to instead get all releases and look for a release that matches the tag.
 * @param string repo Git repo name
 * @param string username Git repo username
 * @param string tag of release
 * @param function callback
 * @return object Release object or false if not found.
 */

function getUnpublishedReleaseOLD(repo, username, tag, callback) {
    getAllGitHubReleases(
            repo,
            username,
            function (err, releases) {

                for (release in releases) {

                    release = releases[release];

                    if (release.tag_name === tag) {
                        callback(release);
                        return;
                    }


                }

                callback(false); //release wasn't found
                return;


            }
    )
}

/**
 * Get All GitHub Releases
 *
 *  Returns ann array of release objects.
 * @param string repo Git repo name
 * @param string username Git repo username
 * @param string tag of release
 * @return object Release object or false if not found.
 */


function getAllGitHubReleasesOLD(repo, username, callback, per_page, page) {
    if (!per_page) {
        per_page = 10;
    }

    if (!page) {
        page = 1;
    }

    var client = githubAPI.client(
            token.getGitHubToken()
            );
    var endpoint = '/repos/' + username + '/' + repo + '/releases';



    var parse = require('parse-link-header');


    client.get(
            endpoint,
            {"per_page": per_page, "page": page},
            function (err, status, body, headers) {

                if (err) {
                    throw err;
                    body = false; //release not found
                }
                //look at the link header and check its last property
                var parsed = parse(headers.link);



                if (parsed && parsed.last && (parsed.last.page !== page)) {

                    getAllGitHubReleases(repo, username, callback, per_page, page + 1);

                }
                callback(err, body);



            });

}




/**
 * List Tags)
 *
 * Lists all tags or tag specified with a tag option , ger-list-tag -t 1.2.3
 * @param void
 * @return void
 */

gulp.task('ger-list-tags-old', function (cb) {



    function _printTag(tag) {

        if (argv.a) {
            console.log(tag);
        } else {


            //   release = releases[release];

            console.log("Name: " + tag.name);
            console.log("Zipball: " + tag.zipball_url);
            console.log("Tarball: " + tag.tarball_url)
            console.log("SHA: " + tag.commit.sha)
            console.log("SHA URL: " + tag.commit.url)

            console.log("------------------------")
        }
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


                            _printTag(tag);

                            return cb();



                        }
                )

    }

    //else list all
    getAllGitHubTags
            (
                    getGitHubRepoName(), //repo
                    getGitHubUserName(), //username
                    function (err, tags) {
                        if (err)
                            throw err;


                        for (tag in tags) {
                            tag = tags[tag];

                            _printTag(tag);

                        }



                    }
            )

    return cb();


});


/**
 * List Release(s)
 *
 * Lists all releases or release specified with a tag option , ger-list -r 1.2.3
 * @param void
 * @return void
 */

gulp.task('ger-list-releases-old', function (cb) {



    function _printRelease(release) {

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


                            _printRelease(release);

                            return cb();

                        }
                )
        return
    }

    //else if no tag is provided with the -r option, list all releases 
    getAllGitHubReleases
            (
                    getGitHubRepoName(), //repo
                    getGitHubUserName(), //username
                    function (err, releases) {
                        if (err)
                            throw err;


                        for (release in releases) {
                            release = releases[release];

                            _printRelease(release);

                        }



                    }
            )

    return cb();


});


/**
 * Delete All GitHub Tags without Prompt
 * This will delete all remote tags on GitHub and local tags that match them.
 * 
 * @param dryrun boolean Set to false to delete
 * @param callback function Callback function
 * @return void
 */

function deleteAllGitHubTagsOLD(dryrun, callback) {
    var count = 0;
    if (typeof (dryrun) === 'undefined') {
        dryrun = false;
    }


    var username = getGitHubUserName();
    var repo = getGitHubRepoName();
    var endpoint = '/repos/' + username + '/' + repo + '/tags';


    getAllGitHubItems(
            endpoint,
            repo, //repo
            username, //github username
            pageCallback, //callback function called after each page is processed.
            finalCallback //callback function called when all pages are complete.

            );


    //delete each item when a page is returned from the API
    function pageCallback(err, tags) {


        for (tag in tags) {
            count++;


            tag = tags[tag];
            if (dryrun) {


                console.log(count + " deleting tag (dryrun) " + tag.name);
            } else {

                deleteTag(tag, function (result) {

                    console.log(result.local_message);
                    console.log(result.remote_message);

                });

            }



        }


    }

    function  finalCallback(err) {

        if (!err) {
            console.log('All Tags Deleted');
            return callback();

        }
        console.log(err.message);


    }





}

/**
 * Delete All Releases without Prompt
 *
 * @param void
 * @return void
 */

function deleteAllGitHubReleasesOld(callback, dryrun) {
    if (typeof (dryrun) === 'undefined') {
        dryrun = false;
    }

    var count = 0;
    getAllGitHubReleases(
            getGitHubRepoName(), //repo
            getGitHubUserName(), //github username
            function (err, releases) {


                for (release in releases) {
                    count++;


                    release = releases[release];
                    if (dryrun) {


                        console.log(count + " deleting release (dryrun) " + release.tag_name);
                    } else {

                        deleteGitHubReleaseByTag
                                (
                                        getGitHubRepoName(), //repo
                                        getGitHubUserName(), //username
                                        release.tag_name //tag

                                        )

                    }



                }
                return callback();
            }

    );


}

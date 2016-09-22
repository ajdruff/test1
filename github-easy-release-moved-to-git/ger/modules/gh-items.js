/*
 *  gh-items.js
 *  
 *  GitHub Items
 *  Recursive call that allows iterating through all pages of items 
 *  (normally limited to first 10 items)
 */


/**
 * Get Unpublished GitHub Release
 * Given a tag,searches for a draft release. If you want to search for all releases, use getGitHubRelease (its faster).
 * 
 * @param callback function Callback function
 * @return void
 */
module.exports = function (gulp, argv, project_dir, ger_dir) {

//public modules
    var githubAPI = require('octonode');//github api node library 

//private modules
    var requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')
            , token = modules("token.js")(gulp, argv, project_dir, ger_dir);

    /**
     * Get All GitHub Items
     *
     * Returns the body of a GitHub API call that returns a list of items. Supports releases and tags.
     * @param string endpoint The API url endpoint to be called e.g.: 
     * @param string repo Git repo name
     * @param string username Git repo username
     * @param string pageCallback The function to be called for each page. For example, to list each item that was returned in the page's json object.
     * @param string finalCallback The function to be called when the all pages have been returned. (for example to print a final message that the listing is complete)
     * @parem integer per_page The number of items to be returned per page.
     * @param integer page The page to be called.
     * @return object API object or false if not found.
     */
    module.getAllGitHubItems = function (endpoint, repo, username, pageCallback, finalCallback, per_page, page, page_increment) {

        if (typeof (per_page) === "undefined") {
            per_page = 10;
        }

        if (typeof (page) === "undefined") {
            page = 1;
        }
        if (typeof (page_increment) === "undefined") {
            page_increment = 1;
        }


        var client = githubAPI.client(
                token.getGitHubToken()
                );




        var parse = require('parse-link-header');


        client.get(
                endpoint,
                {"per_page": per_page, "page": page},
                function (err, status, body, headers) {
                    var isLastPage;
//console.log(headers);

                    if (err) {
                        console.log("endpoint:" + endpoint);
                        throw err;
                        body = false; //release not found
                    }

                    //use link header to determine if we are on last page
                    //if current page is equal to l
                    var parsed = parse(headers.link);
                    if ((body.length === 0)) {

                        err = new Error('No items found');
                        return finalCallback(err, {});

                    }
                    //   var isLastPage = (parsed && parsed.last && (parsed.last.page !== page));
                    // var isLastPage = (typeof(parsed.next)==="undefined");
                    // console.log("parsed.prev=" + JSON.stringify(parsed.prev));
                    // console.log("parsed.next=" + JSON.stringify(parsed.next));
                    //console.log("parsed.last=" + JSON.stringify(parsed.last));
                    if (parsed !== null) {
                        if (parsed.next)
                            var page_number = (Number(+parsed.next.page - +1));
                        if (parsed.prev)
                            var page_number = (Number(+parsed.prev.page + 1));
                        isLastPage = (
                                (!parsed.prev) && (!parsed.next))  //if single page (no previous and no next)
                                || (!parsed.next) // or if no next page.
                    } else {
                        isLastPage = true;
                    }



                    if (!isLastPage) {


                        // console.log("page " + page_number);
                        pageCallback(err, body, function gitHubItemsCallback(err, result) { //result param isnt used here but we keep it for consistency with final
                            module.getAllGitHubItems(endpoint, repo, username, pageCallback, finalCallback, per_page, page + page_increment);

                        });
                    } else {

                        pageCallback(err, body, function gitHubItemsCallback(err, result) {//result param is used here since we pass it onto our final callback


                            return finalCallback(err, result);


                        });




                    }




                });

    }

    return module;
}
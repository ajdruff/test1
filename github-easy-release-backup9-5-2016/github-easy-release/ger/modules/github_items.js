
var fs = require('fs'); //file system library
var package_dir = __dirname + "/../../"; //point to directory containing package.json
var project_package_dir = __dirname + "/../../../"; //point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander


module.exports = function (gulp) {

};






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
 module.exports.getAllGitHubItems = function (endpoint, repo, username, pageCallback, finalCallback, per_page, page) {

    if (!per_page) {
        per_page = 2;
    }

    if (!page) {
        page = 1;
    }

    var client = githubAPI.client(
            token.getGitHubToken()
            );




    var parse = require('parse-link-header');


    client.get(
            endpoint,
            {"per_page": per_page, "page": page},
            function (err, status, body, headers) {

                if (err) {
                    throw err;
                    body = false; //release not found
                }

                //use link header to determine if we are on last page
                //if current page is equal to l
                var parsed = parse(headers.link);
                // console.log(headers.link);
                if ((parsed) === null) {
                    console.log('No releases to delete');
                    finalCallback(err);
                    return;
                }
                //   var isLastPage = (parsed && parsed.last && (parsed.last.page !== page));
                // var isLastPage = (typeof(parsed.next)==="undefined");
                // console.log("parsed.prev=" + JSON.stringify(parsed.prev));
                // console.log("parsed.next=" + JSON.stringify(parsed.next));
                //console.log("parsed.last=" + JSON.stringify(parsed.last));
                if (parsed.next)
                    var page_number = (Number(+parsed.next.page - +1));
                if (parsed.prev)
                    var page_number = (Number(+parsed.prev.page + 1));
                var isLastPage = ((!parsed.prev) && (!parsed.next)) || (!parsed.next);

                if (!isLastPage) {


                    // console.log("page " + page_number);
                    pageCallback(err, body, function gitHubItemsCallback(err, result) {
                        getAllGitHubItems(endpoint, repo, username, pageCallback, finalCallback, per_page, page + 1);

                    });
                } else {

                    pageCallback(err, body, function gitHubItemsCallback(err, result) {

                        console.log("last page " + page_number);
                        return finalCallback(err, result);


                    });




                }




            });

}

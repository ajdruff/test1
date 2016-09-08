
var fs = require('fs'); //file system library
var package_dir = __dirname + "/../../"; //point to directory containing package.json
var project_package_dir = __dirname + "/../../../"; //point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander





/**
 * Render Template
 *
 * Renders text by replacing a template's tokens with its values
 
 * @param string template The template
 * @return string The rendered output
 */
 module.exports.render = function (template) {


    var now = moment();//provides timestamp

    template = template
            .replace('{VERSION_NUMBER}', getProjectVersion())
            .replace("{TAG}", getConfig().tag) //dont use getTag() or endless loop

            .replace("{NOW}", now.format("dddd, MMMM Do YYYY, h:mm:ss a Z"));
    return template;
}

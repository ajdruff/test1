
var fs = require('fs'); //file system library
var package_dir = __dirname + "/../../"; //point to directory containing package.json
var project_package_dir = __dirname + "/../../../"; //point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander


module.exports = function (gulp) {

};



/**
 * Exec Command
 *
 * Execute a command on the command line
 * @param string cmd The command to be executed , including options
 * @param object The exec options for the child_process call. 
 * @param function The calback function
 * @return string The parsed output of the form body tag
 */
 module.exports.execCmd = function (cmd, opt, cb) {


    //figure out which optional arguments were passed
    //(tag,cb)
    if (!cb && typeof opt === 'function') {

        cb = opt;
        opt = {};
    }
    //(tag,opt) or tag,opt,'' or (tag)
    if (!cb || typeof cb !== 'function')
        cb = function () {};
    if (!opt)
        opt = {};
    if (!opt.cwd) //set working directory
        opt.cwd = process.cwd();
    if (!opt.args)
        opt.args = ' ';

    var maxBuffer = opt.maxBuffer || 200 * 1024;






    return exec(cmd, {cwd: opt.cwd, maxBuffer: maxBuffer}, function (err, stdout, stderr) {
        if (opt.quiet)
            return cb(null, null, null);
        if (err)
            return cb(err, stdout, stderr);


        return cb(err, stdout, stderr);

    });
}
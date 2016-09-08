
var fs = require('fs'); //file system library
var package_dir = __dirname + "/../../"; //point to directory containing package.json
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander


module.exports = function (gulp) {



    gulp.task('ger-version', function () {


        console.log('GitHub Easy Release (GER) Version ' +  module.exports.getVersion());


    });
};


/**
 * Get the GER Package.json object
 *
 * Returns the package.json global object
 * @param void
 * @return object The object parsed from package.json
 */

 module.exports.getPackage = function () {
    if (fs.existsSync(package_dir + 'package.json')) {
        return JSON.parse(fs.readFileSync(package_dir + 'package.json', 'utf8'));
    } else {

        throw new Error('Missing GER package.json.')
    }
}

/**
 * Get GER Version
 *
 * @param void
 * @return string The current version from GER package.json
 */
 module.exports.getVersion = function () {
    // We parse the json file instead of using require because require caches
    // multiple calls so the version number won't be updated
    return  module.exports.getPackage().version;
}


/**
 * Get Configuration
 *
 * Returns GER's configuration. 
 *
 * @param void
 * @return configuration object parsed from GER's package.json
 */

 module.exports.getConfig = function () {

    return module.exports.getPackage().config;
}

  
  
/**
 * Set GER Package Configuration
 *
 * Updates a key/value pair in the config setting of package.json configuration by parsing command line for key/value pair
 * @param void
 * @return void
 */
 module.exports.setPackageConfig = function (){

    var this_packagejson;
    var tokenjson = {};
    this_packagejson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    var config = argv.c;

    if (typeof argv.c === 'boolean') {
        throw new Error("Please supply a key/value pair for configuration. 'gulp ger -h for example.'");
    }

    var key_value = config.split("=", 2);

    if (typeof key_value[0] === 'undefined' || typeof key_value[1] === 'undefined') {
        throw new Error("Invalid key/value pair.");
    }

    if (key_value[0] === "token") {
        tokenjson[key_value[0]] = key_value[1];
        fs.writeFileSync('token.json', JSON.stringify(tokenjson, null, 2));
    } else {
        this_packagejson['config'][key_value[0]] = key_value[1];
        fs.writeFileSync('package.json', JSON.stringify(this_packagejson, null, 2));
    }
    console.log("Package.json successfully updated . " + JSON.stringify(this_packagejson.config));
}
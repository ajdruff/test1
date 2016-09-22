
/**
 * Package Module
 * package.js
 * 
 * Package.json functions
 * 
 */
module.exports = function (gulp, argv, project_dir, ger_dir) {


//public modules
    var path = require("path")
            , fs = require('fs') //file system library

//private modules

    var requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')






    /**
     * Get the GER Package.json object
     *
     * Returns the package.json global object
     * @param void
     * @return object The object parsed from package.json
     */

    module.getPackage = function () {
       var package_path=path.join(ger_dir , 'package.json');
        if (fs.existsSync(package_path)) {
            return JSON.parse(fs.readFileSync(package_path), 'utf8');
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
    module.getVersion = function () {
        // We parse the json file instead of using require because require caches
        // multiple calls so the version number won't be updated
        return  module.getPackage().version;
    }


    /**
     * Get Configuration
     *
     * Returns GER's configuration. 
     *
     * @param void
     * @return configuration object parsed from GER's package.json
     */

    module.getConfig = function () {

        return module.getPackage().config;
    }



    /**
     * Set GER Package Configuration
     *
     * Updates a key/value pair in the config setting of package.json configuration by parsing command line for key/value pair
     * @param void
     * @return void
     */
    module.setPackageConfig = function () {
        var token_file=path.join(ger_dir, 'token.json');
        var package_file=path.join(ger_dir, 'package.json');

        var packagejson;
        var tokenjson = {};
        packagejson = JSON.parse(fs.readFileSync(package_file, 'utf8'));

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
            fs.writeFileSync(token_file, JSON.stringify(tokenjson, null, 2));
        } else {
            packagejson['config'][key_value[0]] = key_value[1];
            fs.writeFileSync(package_file, JSON.stringify(packagejson, null, 2));
        }
        console.log("Package.json successfully updated . " + JSON.stringify(packagejson.config));
    }
    return module;
}
/*
 *  template.js
 *  
 *  Provides name/value replacement for text templates
 */


module.exports = function (gulp, argv, project_dir, ger_dir) {
//public modules
    var path = moment = require("moment");//time stamp

//private modules
    var requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')
            , package = modules('package.js')(gulp, argv, project_dir, ger_dir)
            , project = modules('project.js')(gulp, argv, project_dir, ger_dir)


    /**
     * Render Template
     *
     * Renders text by replacing a template's tokens with its values
     
     * @param string template The template
     * @return string The rendered output
     */
    module.render = function (template) {


        var now = moment(); //provides timestamp

        template = template
                .replace('{VERSION_NUMBER}', project.getVersion())
                .replace("{TAG}", package.getConfig().tag) //dont use getTag() or endless loop

                .replace("{NOW}", now.format("dddd, MMMM Do YYYY, h:mm:ss a Z"));
        return template;
    }
    return module;
}

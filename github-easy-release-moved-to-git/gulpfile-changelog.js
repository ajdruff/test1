

var gulp = require('gulp');
var argv = require('minimist')(process.argv);//https://www.npmjs.com/package/minimist //consider commander https://www.npmjs.com/package/commander
    var conventionalChangelog = require('gulp-conventional-changelog');//update changelog

var
        requireFrom = require('requirefrom')
        , modules = requireFrom('ger/modules/')

    var path = require("path")
    var ger_dir = path.join(__dirname, '../../');//point to directory containing package.json
    var project_dir = path.join(__dirname, '../');//directory containing .git repo


console.log(project_dir);
//tasks


    gulp.task('changelog', function () {
        return gulp.src(path.join(project_dir, "CHANGELOG.md"), {
            buffer: false
        })
                .pipe(conventionalChangelog({
                    preset: 'angular',
             path: path.join(project_dir, "package.json"),
            releaseCount:1
            
                },{
            currentTag: "v1.1.0",
            version: "1.1.0"}))
                .pipe(gulp.dest(project_dir));
    });




    
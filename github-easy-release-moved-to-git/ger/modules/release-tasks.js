


/*
 *  release-tasks.js
 *  
 *  release tasks, meant to be supporting 'private' and called by other public tasks
 */


module.exports = function (gulp, argv, project_dir, ger_dir){
//public modules
    var path = require("path")
            , runSequence = require('run-sequence')//force synchronous execution
            , conventionalChangelog = require('gulp-conventional-changelog')//update changelog
            , bump = require('gulp-bump')//increase version number
            , gutil = require('gulp-util')
            , git = require('gulp-git')//git
            , marked = require('marked') //markdown library
            , fs = require("fs")//file system library
            , liquid = require("gulp-liquid")// stream replace
            , rename = require("gulp-rename")//stream rename
            , github_api = require('octonode')//github api node library github_api
            , moment = require("moment")//time stamp

//private modules
    var requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')
            , package = modules('package.js')(gulp, argv, project_dir, ger_dir)
            , project = modules('project.js')(gulp, argv, project_dir, ger_dir)
            , template_mod = modules('template.js')(gulp, argv, project_dir, ger_dir)
            , release_mod = modules('release.js')(gulp, argv, project_dir, ger_dir)
            , tag_mod = modules('tag.js')(gulp, argv, project_dir, ger_dir)
            , token =modules('token.js')(gulp, argv, project_dir, ger_dir)



    gulp.task('release', function release(callback) {


        //check for release option
        if (!argv.b && !argv.n) {
            console.log("Skipping release.");
            callback();
            return;
        }


        if (!release_mod.checkReleaseType()) {
            console.log(chalk.red(("Missing or invalid release type. Cannot continue with release.")));
            callback();
            return;
        }

        runSequence(
                'checkout-master',
                'set-version',
                'changelog',
                'commit-master',
                'create-tag',
                'push-master',
                'github-release',
                function (error) {
                    callback(error);
                });
    });

    gulp.task('release-test', function release(callback) {


        //check for release option
        if (!argv.b && !argv.n) {
            console.log("Skipping release.");
            callback();
            return;
        }


        if (!release_mod.checkReleaseType()) {
            console.log(chalk.red(("Missing or invalid release type. Cannot continue with release.")));
            callback();
            return;
        }

        runSequence(
                'set-version',
                'changelog',
                function (error) {

                    callback(error);
                });
    });




    /*
     * GitHub API Create Release
     */
    gulp.task('github-release', function github_release(cb) {

//build a client from a token
        var client = github_api.client(
                token.getGitHubToken()
                );

        var ghrepo = client.repo(
                project.getGitHubUserName() + '/' + project.getGitHubRepoName() // e.g.: 'ajdruff/projectname'
                );

        var now = moment();



        var template = package.getConfig().release_note;
        var default_template = "released {NOW}";

        //use default template if the provided template is empty
        if (template.trim() === "") {
            template = default_template;
        }


        var body = template_mod.render(template);
        var options =
                {
                    "tag_name": tag_mod.getTag(),
                    "target_commitish": "master",
                    "name": tag_mod.getTag(),
                    "body": body,
                    "draft": false,
                    "prerelease": (argv.b === "prerelease")
                }
        ;
        ghrepo.release(options, function (err, data, headers) {


            if (err) {
                console.log(options);
                console.log(err);
                throw err;
            }
            cb();

        });



    });




    gulp.task('commit-master', function commit_master() {




        var q = require('bluebird'); //need promises since commit doesnt normally return stream. see https://github.com/stevelacy/gulp-git/issues/49
        return new q(function (resolve, reject) {

            var commit_message = template_mod.render(package.getConfig().commit_message);
            //copy index.html to gh-pages
            return gulp.src('../')
                    .pipe(git.add())
                    .pipe(stream = git.commit(commit_message)).on('error', function (e) {
                console.log('No changes to commit');
            })

                    .on('error', resolve) //resolve to allow the commit to resume even when there are not changes.
                    .on('end', resolve);



            stream.resume(); //needed since commmit doesnt return stream by design.


            ;







        });

    });

    gulp.task('push-master', function push_master(cb) {

        return git.push('origin', 'master', {args: '--tags'}, function (err) {

            if (err)
                throw err;
            cb();

        });


    });


    gulp.task('push-gh-pages', function push_gh_pages(cb) {
        git.push('origin', 'gh-pages', cb);


    });




    gulp.task('commit-gh-pages', function commit_gh_pages(cb) {


        var q = require('bluebird'); //need promises since commit doesnt normally return stream. see https://github.com/stevelacy/gulp-git/issues/49
        return new q(function (resolve, reject) {


            //copy index.html to gh-pages
            gulp.src('../index.html')
                    .pipe(stream = git.commit('updated gh-pages readme ')).on('error', function (e) {
                console.log('No changes to commit');
            })

                    .on('error', resolve) //resolve to allow the commit to resume even when there are not changes.
                    .on('end', resolve);



            stream.resume(); //needed since commmit doesnt return stream by design.


            ;







        });

    });

    gulp.task('copy-converted-readme-to-gh-pages-branch', function copy_converted_readme_to_gh_pages_branch(cb) {

        //copy index.html to gh-pages
        return gulp.src(__dirname + '/gh-pages/cache/readme.html')
                .pipe(rename("index.html"))
                .pipe(gulp.dest('../'), function (err) {
                    if (err)
                        throw err;



                })

                .pipe(git.add(), function (err) {
                    if (err)
                        throw err;



                });


    });

    gulp.task('checkout-ghpages', function checkout_ghpages(cb) {


        return git.checkout('gh-pages', function (err) {
            if (err)
                throw err;
            cb();
        });

    });

    gulp.task('checkout-master', function checkout_master(cb) {

        return git.checkout('master', function (err) {
            if (err)
                throw err;
            cb();
        });
    });

    gulp.task('fetch', function fetch(cb) {

        git.fetch('origin', '', {}, function (err) {
            if (err)
                throw err;
            cb();
        });

    });

    gulp.task('push-gh-pages-changes', function push_gh_pages_changes(cb) {
        git.push('origin', 'gh-pages', cb);

    });


    /**
     * changelog (TASK)
     *
     * Creates a changelog based on current version and commits in angular style
     * @param string taskName
     * @return function Callback
     */




    gulp.task('changelog', function (cb) {

        var releaseCount = 1;  //How many releases of changelog you want to generate.  https://github.com/conventional-changelog/conventional-changelog-core

        //you can pass an argument for regenerating changelog from scratch.
        //normally, each call will generate entry for the current version
        if (argv.r) {
            //regenerate change log
            releaseCount = 0;
        }
        //remember the current working directory because we're going to change it.
        var previous_dir = process.cwd();

        //change to the project directory so changelog picks up the project package.json
        process.chdir(project_dir);

        //get the path to the project's changelog (must already exist)
        var changelog_path = path.join(project_dir, package.getConfig().changelog);


        var options = //these are conventional-changelog options https://github.com/conventional-changelog/conventional-changelog
                {
                    preset: package.getConfig().changelog_preset, //the preset used per conventional-changelog
                    releaseCount: releaseCount, // Or to any other commit message convention you use.

                };
        var context = //from conventional-changelog-core options https://github.com/conventional-changelog/conventional-changelog
                {
                    currentTag: tag_mod.getTag(), //necessary since conventional-changelog assumes v<version> but out template might be different
                    version: project.getVersion()  //not necessary since its the default
                };

        //   console.log("changelog source = " + changelog_path);

        return gulp.src(
                changelog_path,
                {
                    buffer: false
                }
        )



                .pipe(conventionalChangelog
                        (
                                options
                                //,context
                                ))
                .pipe(gulp.dest(project_dir))
                .on('finish', function () {
                    console.log("updated changelog");
                    process.chdir(previous_dir); //need to change back to previous directory so our other build processes dont break
                });

        ;







    });






    gulp.task('convert-readme-to-html', function convert_readme_to_html() {
        var readme_file=path.join(project_dir,package.getConfig().readme);
        var readme_html_file=path.join(ger_dir,"/gh-pages/_layouts/index.html");
        
        if (fs.existsSync("../" + package.getConfig().readme)) {
            var fileContent = fs.readFileSync(readme_file, "utf8");
        } else {

            throw new Error('Cannot find the ' + package.getConfig().readme + ". To fix this, set the package.json `readme` setting to the name of your readme file.")
        }


        marked.setOptions({
            renderer: new marked.Renderer(),
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: true,
            smartLists: true,
            smartypants: false
        });


        fileContent = marked(fileContent);

        return gulp.src(__dirname + '/gh-pages/_layouts/index.html')
                .pipe(liquid({
                    locals: {
                        CONTENT: fileContent.toString(),
                        GITHUB_REPO: project.getGitHubRepoName(),
                        GITHUB_USERNAME:  project.getGitHubUserName(),
                        VERSION_NUMBER: project.getVersion()
                    }
                }))


                .pipe(rename('readme.html'))
                .on('end', function () {
                    //console.log('replaced liquid tags')
                })
                .pipe(gulp.dest(__dirname + '/gh-pages/cache'));
    });




    gulp.task('set-version', function set_version(cb) {

        if (!argv.b && !argv.n) {
            console.log("You must supply a -b or -n argument. Please try ger-set-version-help for more info");
            return cb();
        }

//bump to next version, or set version explicitly, depending on which options are passed.
        if (argv.b) {


            // argv.b will supply what kind of version change type  we are releasing 'patch' 'major' or 'minor'

            return  gulp.src([path.join(project_dir, 'bower.json'), path.join(project_dir, 'package.json')])
                    .pipe(bump({type: argv.b}).on('error', gutil.log))
                    .pipe(gulp.dest(project_dir));

        } else {

            if (argv.n) {


                project.setVersion(argv.n, function (err) {
                    if (err)
                        throw err;
                    cb()

                });

            }
        }
        cb();

    });
    gulp.task('updateGhPages', function updateGhPages(callback) {

        //if ghpages false, but argv.p, then do it
        if (!argv.p) {
            ghpages = package.getConfig().ghpages;
        }
        if (argv.p) {
            ghpages = true;
        }
        if (!(ghpages)) {
            console.log("Skipping gh-pages update per package.json{config:{ghpages} setting");
            callback();
            return;
        }

        runSequence(
                'checkout-master',
                'convert-readme-to-html',
                'fetch',
                'checkout-ghpages',
                'copy-converted-readme-to-gh-pages-branch',
                'commit-gh-pages',
                'push-gh-pages',
                'checkout-master',
                function (error) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log('GitHub Pages updated successfully.');
                    }
                    callback(error);
                });
    });



    gulp.task('create-tag', function create_tag(cb) {

        module.exports.createTag(function () {
            return cb();
        });







    });

};





/*
 *  ger-tasks.js
 *  
 *  GER Tasks, meant to be 'public' and called by user at command line.
 */

module.exports = function (gulp, argv, project_dir, ger_dir) {


//public modules
    var path = require("path")
            , runSequence = require('run-sequence')//force synchronous execution

//private modules
    var requireFrom = require('requirefrom')
            , modules = requireFrom('ger/modules/')
            , package = modules('package.js')(gulp, argv, project_dir, ger_dir)
            , help = modules('help.js')(gulp, argv, project_dir, ger_dir)
            , project = modules('project.js')(gulp, argv, project_dir, ger_dir)
            , prompt = modules('prompt.js')(gulp, argv, project_dir, ger_dir)
            , exec = modules('exec.js')(gulp, argv, project_dir, ger_dir)
            , template_mod = modules('template.js')(gulp, argv, project_dir, ger_dir)
            , release_mod = modules('release.js')(gulp, argv, project_dir, ger_dir)
            , tag_mod = modules('tag.js')(gulp, argv, project_dir, ger_dir)



//task modules
    modules('release-tasks.js')(gulp, argv, project_dir, ger_dir);//expose gulp tasks

    /**
     * 
     * Tasks
     * 
     */
    /**
     * default (TASK)
     *
     * Wrapper 
     * @param string taskName
     * @return function Callback
     */

    gulp.task('default', function default_task(callback) {

        gulp.start('ger');
        callback();
        return;

    });
    
    
    gulp.task('ger-test', function ger_test(cbTask) {

        release_mod.showArgv();
        return cbTask();
//test template

        var template = " My Project tag is {TAG} and version is {VERSION_NUMBER} at time {NOW} ";

        var content = template_mod.render(template);
        console.log(content);


        return cbTask();
// test prompt
        var dryrun = false;
        if (argv.d) {
            dryrun = true;
        }
        options = {
            prompt_message: "Do you really want to delete all tags [y/n]?",
            default_answer: "n"
        }

        prompt.promptYesNo(options, function (yes) {

            if (yes) {
                exec.execCmd(
                        "ls -ail",
                        {},
                        function (err, stdout, stderr) {
                            if (err) {
                                throw err;
                            }
                            if (stderr) {
                                console.log('Something went wrong:' + stderr);
                                return cb();
                            }
                            console.log(stdout);
                            return cb();
                        });
            } else {

                console.log('Delete cancelled, no tags were deleted');
                return cbTask();
            }


        });


        return;



        exec.execCmd(
                "ls -ail",
                {},
                function (err, stdout, stderr) {
                    if (err) {
                        throw err;
                    }
                    if (stderr) {
                        console.log('Something went wrong:' + stderr);
                        return cb();
                    }
                    console.log(stdout);
                    return cb();
                });
    });
    
        /**
     * ger-version (TASK)
     *
     * Displays Version of GER
     * @param string taskName
     * @return function Callback
     */
    gulp.task('ger-version', function () {


        console.log('GitHub Easy Release (GER) Version ' +  package.getVersion());


    });
    
    
    /**
     * ger (TASK)
     *
     * Main release task. Call it without options and it will display help
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger', function ger(callback) {


        //display help if no options provided
        if (Object.keys(argv).length === 1) {
            help.showDefaultHelp();

            callback();
            return;
        }


//if release or update pages.
        if (argv.p || argv.b || argv.n) {

            runSequence(
                    'release',
                    'updateGhPages',
                    function (error) {
                        if (error) {
                            console.log(error.message);
                        } else {
                            console.log('RELEASE ' + project.getVersion() + ' completed successfully.');
                        }
                        callback(error);
                    });
            return;
        }

//configuration
        if (argv.c) {
            package.setPackageConfig();
            callback();
            return;
        }

        if (!argv.n && argv.t) {
            console.log('You must specify a version with -n if you specify  -t tag');
            callback();
            return;
        }

        console.log('Invalid options. See ger-help for valid options and examples.');
        callback();

    });





    /**
     * ger-major (TASK)
     *
     * Creates a release (semver major) Bumps version to next major increment
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-major', function ger_major(callback) {
        if (argv.n) {
            console.log("-n won't work with this task, try ger -n instead ");//this is because aliases always set -b and -b overrides -n
            callback();
            return;
        }

        argv.b = "major";
        gulp.start('ger');
        callback();
        return;

    });

    /**
     * ger-minor (TASK)
     *
     * Creates a release (semver minor) Bumps version to next minor increment
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-minor', function ger_minor(callback) {

        if (argv.n) {
            console.log("-n won't work with this task, try ger -n instead ");//this is because aliases always set -b and -b overrides -n
            callback();
            return;
        }

        argv.b = "minor";
        gulp.start('ger');
        callback();
        return;

    });

    /**
     * ger-patch (TASK)
     *
     * Creates a release (semver patch) Bumps version to next patch increment
     * @param string taskName
     * @return function Callback
     */
    gulp.task('ger-patch', function ger_patch(callback) {



        if (argv.n) {
            console.log("-n won't work with this task, try ger -n instead ");//this is because aliases always set -b and -b overrides -n
            callback();
            return;
        }


        argv.b = "patch";
        gulp.start('ger');
        callback();
        return;

    });

    /**
     * ger-prerelease (TASK)
     *
     * Creates a prerelease Bumps version to next pre-release increment
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-prerelease', function ger_prerelease(callback) {

        if (argv.n) {
            console.log("-n won't work with this task, try ger -n instead ");//this is because aliases always set -b and -b overrides -n
            callback();
            return;
        }

        argv.b = "prerelease";
        gulp.start('ger');
        callback();
        return;
    });


    /**
     * ger-delete-all-releases (TASK)
     *
     * Deletes all releases
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-delete-all-releases', function ger_delete_all_releases(cbTask) {

        var dryrun = (argv.d);


        options = {
            prompt_message: "Do you really want to delete all releases [y/n]?",
            default_answer: "n"
        }

        prompt.promptYesNo(options, function (yes) {

            if (yes) {
                release_mod.deleteAllGitHubReleases(
                        dryrun //dryrun
                        , function (err, result) {
                            if (err) {
                                console.log(err.message);
                            } else {
                                console.log('Completed deleting releases. ' + result.total + ' releases deleted.');
                            }


                            return cbTask()
                        }
                );
            } else {

                console.log('Delete cancelled, no releases were deleted');
                return cbTask();
            }


        });









    });




    /**
     * ger-delete-release (TASK)
     *
     * Deletes a single release
     * 
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-delete-release', function ger_delete_release(cb) {
        if (!argv.t) {

            console.log("No release to delete! Specify release to be deleted with the -t option. `gulp ger` for help ");
            return cb();

        }
        var tag = argv.t;
        options = {
            prompt_message: "Do you really want to delete release " + tag + " [y/n]?",
            default_answer: "n"
        }

        prompt.promptYesNo(options, function (yes) {

            if (yes) {
                release_mod.deleteGitHubReleaseByTag
                        (
                                project.getGitHubRepoName(), //repo
                                project.getGitHubUserName(), //username
                                argv.t, //tag,
                                function (result) {
                                    var dryrun_text = "";
                                    var release = result.release;
                                    if (argv.d) {
                                        dryrun_text = "(dryrun)";
                                    }
                                    if (result.deleted) {
                                        console.log(dryrun_text + "Release for tag " + release.tag_name + " was successfully deleted.");

                                    } else {

                                        console.log(dryrun_text + "Release could not be deleted. ");
                                        if (result.error) {
                                            console.log(result.error.message)
                                        }



                                    }
                                    return cb();
                                }

                        )
            } else {

                console.log('Delete cancelled.');
                return cb();

            }


        });


    });

    /**
     * ger-set-version (TASK)
     *
     * Wrapper around set-version
     * 
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-set-version', function ger_set_version(cb) {

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


    /**
     * List Releases (Task)
     *
     * Prints all releases to the console
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-list-releases', function ger_list_releases(cb) {
        var options = {
            "published": true
            , "draft": true
        };
        release_mod.listAllGitHubReleases(
                options
                ,
                function (err, result) {


                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log('Total of ' + result.total + ' releases.');
                    }

                    return cb()


                }
        );






    });


    /**
     * List Published Releases (Task)
     *
     * Prints published releases to the console
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-list-published', function ger_list_published(cb) {
        var options = {
            "published": true
            , "draft": false
        };
        release_mod.listAllGitHubReleases(
                options
                ,
                function (err, result) {

                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log('Found ' + result.found + ' published releases of ' + result.total + ' total.');
                    }
                    return cb()
                }
        );






    });
    /**
     * List Draft Releases (Task)
     *
     * Prints draft releases to the console
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-list-draft', function ger_list_draft(cb) {
        var options = {
            "published": false
            , "draft": true
        };
        release_mod.listAllGitHubReleases(
                options
                ,
                function (err, result) {
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log('Found ' + result.found + ' drafts of ' + result.total + ' total releases.');
                    }

                    return cb()
                }
        );






    });


    /**
     * List Release (Task)
     *
     * Args: -t string tagname
     * Given the tag for a release, prints it to the screen
     * 
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-list-release', function ger_list_release(cb) {

        if (!argv.t) {
            console.log("No tag to list! Specify tag to list with the -t option. `gulp ger` for help ");
            return cb();
        }

        if (argv.t) {
            release_mod.getGitHubRelease
                    (
                            project.getGitHubRepoName(), //repo
                            project.getGitHubUserName(), //username
                            argv.t, //tag
                            function (err, release) {
                                if (!release) {
                                    console.log("Release for " + argv.t + " doesn't exist");
                                    if (err) {
                                        console.log("Error: " + err.message);
                                    }
                                    return cb();

                                }


                                release_mod.printRelease(release);

                                return cb();

                            }
                    )

        }





    });


    /**
     * ger-changelog (TASK)
     *
     * Wrapper around changelog - Creates a changelog based on current version and commits in angular style
     * @param string taskName
     * @return function Callback
     */

    gulp.task('ger-changelog', function ger_changelog(callback) {

        if (argv.r) {
            console.log("regenerating changelog from scratch");

        } else {
            console.log("adding new changelog entry for most recent version.");

        }
        runSequence(
                'changelog',
                function (error) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log('Changelog updated.');
                    }
                    callback(error);
                });



    });




    gulp.task('create-tag', function create_tag(cb) {

        tag_mod.createTag(function () {
            return cb();
        });







    });

    /**
     * List Tags (Task)
     *
     * Prints all tags to the console
     */

    gulp.task('ger-list-tags', function ger_list_tags(cbTask) {

        tag_mod.listAllGitHubTags(
                function (err, result) {

                    if (err) {
                        console.log(err.message);
                        return cbTask();
                    }
                    console.log('Total of ' + result.total + ' tags.');
                    return cbTask()
                }
        );






    });



    /**
     * Delete All Tags
     *
     */

    gulp.task('ger-delete-all-tags', function ger_delete_all_tags(cbTask) {

        var dryrun = false;
        if (argv.d) {
            dryrun = true;
        }
        options = {
            prompt_message: "Do you really want to delete all tags [y/n]?",
            default_answer: "n"
        }

        prompt.promptYesNo(options, function (yes) {

            if (yes) {
                tag_mod.deleteAllGitHubTags(
                        dryrun //dryrun
                        , function (err, result) {
                            if (err) {
                                console.log(err.message);
                                return cbTask();
                            }
                            console.log('Deleted a total of ' + result.total + ' tags.');
                            return cbTask()
                        }
                );
            } else {

                console.log('Delete cancelled, no tags were deleted');
                return cbTask();
            }


        });









    });

    /**
     * Delete Tag
     *
     */

    gulp.task('ger-delete-tag', function ger_delete_tag(cb) {

        if (!argv.t) {

            console.log("No tag to delete! Specify tag to be deleted with the -t option. `gulp ger` for help ");
            return cb();

        }

        var tag = argv.t;


        options = {
            prompt_message: "Do you really want to delete tag " + argv.t + " ? [y/n]",
            default_answer: "n",
        }

        prompt.promptYesNo(options, function (yes) {

            if (yes) {
                tag_mod.deleteTag(argv.t, function (result) {
                    console.log(result.local_message);
                    console.log(result.remote_message);
                    return cb();

                });
            } else {

                console.log(tag + ' was not deleted');
                return cb();
            }


        });








    });


    /**
     * List Tag (Task)
     *
     * Args: -t string tagname
     * Prints a tag object's properties to the console   
     */

    gulp.task('ger-list-tag', function ger_list_tag(cb) {

        if (!argv.t) {
            console.log("No tag to list! Specify tag to list with the -t option. `gulp ger` for help ");
            return cb();
        }

        if (argv.t) {

            console.log('Searching GitHub. This may take a while...');

            tag_mod.getGitHubTag
                    (
                            project.getGitHubRepoName(), //repo
                            project.getGitHubUserName(), //username
                            argv.t, //tag
                            function (err, result) {
                                if (!result.found) {
                                    console.log("Tag for " + argv.t + " doesn't exist");
                                    return cb();

                                } else {
                                    //found, so print it.
                                    tag_mod.printTag(result.tag, function () {
                                        return cb();

                                    });
                                }






                            }
                    )

        }






    });
};



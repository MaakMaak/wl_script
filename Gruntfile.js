module.exports = function (grunt) {
    var jsFiles = ['scripts/**.js'];
    grunt.initConfig({
        jshint: {
            files: jsFiles,
            options: {
                reporterOutput: ""
            }
        },
        watch: {
            script: {
                files: ['scripts/**.js'],
                tasks: ['build']
            }
        },
        concat: {
            options: {
                separator: '\n'
            },
            script: {
                src: [
                    "scripts/userscript_header.js",
                    "scripts/userscript_log.js",
                    "scripts/external_awp.js",
                    "scripts/external_mdl.js",
                    "scripts/twitch.js",
                    "scripts/database.js",
                    "scripts/dashboard_search.js",
                    "scripts/map_search.js",
                    "scripts/tournament.js",
                    "scripts/bookmarks.js",
                    "scripts/community_events.js",
                    "scripts/userscript_settings.js",
                    "scripts/pages.js",
                    "scripts/styles.js",
                    "scripts/util.js",
                    "scripts/error.js",
                    "scripts/other.js",
                    "scripts/profile.js",
                    "scripts/qm_templates.js",
                    "scripts/database_ready.js",
                    "scripts/dom_content_ready.js",
                    "scripts/forum_threads.js",
                    "scripts/forum_editor.js",
                    "scripts/user.js",
                    "scripts/dashboard_refresh.js",
                    "scripts/dashboard_main.js",
                    "scripts/userscript_update.js",
                    "scripts/dashboard_opengames.js",
                    "scripts/community_levels.js",
                    "scripts/forum_sp_levels.js",
                    "scripts/cl_art.js",
                    "scripts/ujs_game.js",
                    "scripts/common_games.js"
                ],
                dest: 'script.main.js'
            }
        },
        concurrent: {
            dev: {
                tasks: ['watch:script'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-concurrent');


    grunt.registerTask('build', ['concat:script']);

};

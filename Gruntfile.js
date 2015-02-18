/**
  @fileoverview main Grunt task file
**/
'use strict';

var webpack = require("webpack");

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    webpack: {
      "element": {
        entry: "./elements/ace-highlight-manager/_ace-highlight-manager.js",
        output: {
          path: "./elements/ace-highlight-manager",
          filename: "ace-highlight-manager.js"
        },
        watch: true
        // keepalive: true
      }
    },

    //less task
    less: {
      development: {
        files: {
          "elements/asq-highlight-presenter/asq-highlight-presenter.css": "elements/asq-highlight-presenter/asq-highlight-presenter.less",
          "elements/asq-highlight-viewer/asq-highlight-viewer.css": "elements/asq-highlight-viewer/asq-highlight-viewer.less",
          "elements/hl-inspector/hl-inspector.css": "elements/hl-inspector/hl-inspector.less",
          "asq-highlight-editor.css": "asq-highlight-editor.less"
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          "elements/asq-highlight-presenter/asq-highlight-presenter.css": "elements/asq-highlight-presenter/asq-highlight-presenter.less",
          "elements/asq-highlight-viewer/asq-highlight-viewer.css": "elements/asq-highlight-viewer/asq-highlight-viewer.less",
          "elements/hl-inspector/hl-inspector.css": "elements/hl-inspector/hl-inspector.less",
          "asq-highlight-editor.css": "asq-highlight-editor.less"
        }
      }
    },

    //watch
    watch: {
      options:{
        livereload: true
      },
      element: {
        files: ['./**/*.js', '!./**/ace-highlight-manager.js'],
        tasks: ["webpack:element"],
        options: {
          interrupt: true
        }
      },
      less: {
        files: ['./**/*.less'],
        tasks: ['less:development'],
        options: {
          livereload: true,
          interrupt: true
        },
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['less', 'webpack', 'watch']);

  //npm tasks
  require('load-grunt-tasks')(grunt);

};

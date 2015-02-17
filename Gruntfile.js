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
          "asq-highlight.css": "asq-highlight.less",
          "asq-highlight-editor.css": "asq-highlight-editor.less",
          "elements/hl-inspector/hl-inspector.css": "elements/hl-inspector/hl-inspector.less",
          "elements/hm-inspector/hm-inspector.css": "elements/hm-inspector/hm-inspector.less"
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          "asq-highlight.css": "asq-highlight.less",
          "asq-highlight-editor.css": "asq-highlight-editor.less",
          "elements/hl-inspector/hl-inspector.css": "elements/hl-inspector/hl-inspector.less",
          "elements/hm-inspector/hm-inspector.css": "elements/hm-inspector/hm-inspector.less"
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

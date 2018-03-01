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
      }
    },

    //less task
    less: {
      development: {
        files: {
          "elements/asq-highlight-presenter-q/ace-marker-styles-presenter.html": "elements/asq-highlight-presenter-q/ace-marker-styles-presenter.less",
          "elements/asq-highlight-viewer-q/ace-marker-styles-viewer.html": "elements/asq-highlight-viewer-q/ace-marker-styles-viewer.less",
          "elements/hl-inspector/hl-inspector-styles.html": "elements/hl-inspector/hl-inspector.less"
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          "elements/asq-highlight-presenter-q/ace-marker-styles-presenter.html": "elements/asq-highlight-presenter-q/ace-marker-styles-presenter.less",
          "elements/asq-highlight-viewer-q/ace-marker-styles-viewer.html": "elements/asq-highlight-viewer-q/ace-marker-styles-viewer.less",
          "elements/hl-inspector/hl-inspector-styles.html": "elements/hl-inspector/hl-inspector.less"
        }
      }
    },

    //concat
    concat: {
      options: {
        footer: '\n    </style>\n' +
                '  </template>\n' +
                '</dom-module'
      },
      css_presenter: {
        options:{
          banner: '<dom-module id="ace-marker-styles-presenter">\n' +
                  '  <template>\n' +
                  '    <style>\n\n'
        },
        src: ['elements/asq-highlight-presenter-q/ace-marker-styles-presenter.html'],
        dest: 'elements/asq-highlight-presenter-q/ace-marker-styles-presenter.html',
      },
      css_viewer: {
        options:{
          banner: '<dom-module id="ace-marker-styles-viewer">\n' +
                  '  <template>\n' +
                  '    <style>\n\n'
        },
        src: ['elements/asq-highlight-viewer-q/ace-marker-styles-viewer.html'],
        dest: 'elements/asq-highlight-viewer-q/ace-marker-styles-viewer.html',
      },
      css_hl_inspector: {
        options:{
          banner: '<dom-module id="hl-inspector-styles">\n' +
                  '  <template>\n' +
                  '    <style>\n\n'
        },
        src: ['elements/hl-inspector/hl-inspector-styles.html'],
        dest: 'elements/hl-inspector/hl-inspector-styles.html',
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
        tasks: ['less:development', 'concat'],
        options: {
          livereload: true,
          interrupt: true
        },
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['less', 'concat', 'webpack', 'watch']);

  //npm tasks
  require('load-grunt-tasks')(grunt);

};

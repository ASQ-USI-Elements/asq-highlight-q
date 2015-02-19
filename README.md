##What is it?
ASQ-Highlight element can be used to to create, deliver and validate highlighting exercises utilizing the [Ace editor](http://ace.c9.io). It can be used in everything that has to do with languages from Programming exercises to English grammar exercises. It started as a summer project by @margaritaG and has now evolved to an editor with edit, highglight and heatmap capabilities.

##Overview
The lifecycle of a highlight question consists of:

* __authoring:__ Use the  [highlight editor](http://asq.inf.usi.ch/microformat/highlight-editor/) to create a question with highlighting tasks.Copy the resulting microformat snippet to your presentation and upload it on ASQ.
* __Presentation:__ During presentation students answer highlight questions while the results can be visualized on the instructors machine with a heatmap. 

#Architecture
ASQ-Highlight comprises three main components:

* __highlight manager:__ The manager interfaces with the ace editor API and implements the highlighting functionality.
*  __microformat:__ The definition for the ``asq-highlight`` question type that can be plugged into ASQ and interfaces with the highlight manager.  
*  __editor:__ Used to create highlight questions, also interfaces with the highlgiht manager.

##Developer
Run the main ``grunt``task to get started:
```
> cd asq-microformat
> npm install
> grunt
```
The default task builds dust templates, less stylesheets and javascript and will watch for any changes in these source files rebuilding them as necessary.

##Editor
To run the  highlight editor locally:
```
> cd asq-microformat
> npm install
> cd ./editor
> node server.js
```

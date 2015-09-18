(function(){

'use strict';

var Heatmap = require('../../src/Heatmap') 
var Range = ace.require('ace/range').Range
	, comparePoints = Range.comparePoints;

	Polymer({
		is:'ace-highlight-manager', 

		properties:{
			editor:{
				type: Object,
				value: function(){return null;},
				observer: '_editorChanged',
				notify: true
			},
			mode:{
				type: String,
				value: "modeHeatmap",
				observer: '_modeChanged',
				notify: true
			},
			colors:{
				type: Array,
				value: function(){return []},
				notify: true
			},
			selectionColor:{
				type: Object,
				value: function(){return null;},
				notify: true
			},
			rangeItems:{
				type: Array,
				value: function(){return []},
				notify: true
			},
			occurenceItems:{
				type: Array,
				value: function(){return []},
				notify: true
			},
			heatmapItems:{
				type: Array,
				value: function(){return []},
				notify: true
			}
		},

		ready: function(){
			 // editor
			 this.MODE_HIGHLIGHT = 'modeHighlight';
			 this.MODE_EDIT_TEXT = 'modeEditText';
			 this.MODE_HEATMAP   = 'modeHeatmap';

			 this.modes = Object.create(null);
			 this.mode = 'modeHeatmap';

			 this.defaultOptions = {
			   mode: this.MODE_HEATMAP
			 };

			this.settings = this.defaultOptions

			 //highlight modes
			 this.HIGHLIGHT_COLOR = 'highlightColor';
			 this.HIGHLIGHT_ERASE = 'highlightErase';

			 this.highlightMode = this.HIGHLIGHT_COLOR;

			 this.colors = [{
			   "color": "d9534f",
			   "name" :'bootstrapred'
			 },
			 {
			   "color": "428bca",
			   "name" : 'blue'
			 },
			 {
			   "color": "5cb85c",
			   "name" : 'green'
			 }];

			 this.heatmapData = {};
			 this.aceEditSession = null;
			 this.selectionColor = this.colors[0];
			 this.oldRange = null;
			 this.oldstart = null;
			 this.lastMarker = null;
			 this.rangeIdPrefix = 'he-range-item-';

			 if(this.editor){
			 	this.init();
			 }
		},

		_editorChanged: function(){
			if(this.editor){
				// TODO: clean previous work
				this.init();
			}
		},

		init: function(){
	    this.modes[this.MODE_EDIT_TEXT] = this.setInEditTextMode.bind(this);
	    this.modes[this.MODE_HEATMAP] = this.setInHeatmapMode.bind(this);
	    this.modes[this.MODE_HIGHLIGHT] = this.setInHighlightMode.bind(this);

	    this.clearSelectionBinded = this.clearSelection.bind(this);
	    this.onChangeSelectionBinded = this.onChangeSelection.bind(this);
	    
	    ///setup ace editor
	    this.aceEditSession = this.editor.getSession();
	    this.modes[this.mode]();
		},

		clearSelection: function(){
	  	this.aceEditSession.selection.clearSelection();
		},

		/**
		* Removes a marker by it's corresponding RangeItem id.
		*/
		removeMarkerByRangeItemId: function(id){
			if(typeof id != "string") return;
			
			id = id.replace(this.rangeIdPrefix, '');
			this.aceEditSession.removeMarker(id)
			this.removeRangeItemByMarkerId(id)
		},

	  /**
	  * merge specific color
	  * 
	  */
	  mergeColor: function(colorName){
	    var ranges = this.getHighlightRanges();
	    if(! ranges[colorName]) return;

	    var removed = this.merge(ranges[colorName]);

      removed.forEach( function(r){
        this.aceEditSession.removeMarker(r.id)
        this.removeRangeItemByMarkerId(r.id)
      }.bind(this));


      ranges[colorName].forEach(function(r){
        var marker = this.aceEditSession.getMarkers()[r.id]
          , text = this.aceEditSession.getTextRange(marker.range);

       this.updateRangeItemTextByMarkerId(r.id, text);

      }.bind(this));
	  },

	  /**
	  * merge all by color
	  * 
	  */
	  mergeByColor: function(){
	  	this.colors.forEach(function(color){
	  		 this.mergeColor(color.color);
	  		}.bind(this));
	  },

	  /**
	  * merge overlapping ranges
	  * 
	  */
	  merge: function(list) {
	    var removed = [];
	    
	    list = list.sort(function(a, b) {
	        return comparePoints(a.start, b.start);
	    });
	    
	    var next = list[0], range;
	    for (var i = 1; i < list.length; i++) {
	        range = next;
	        next = list[i];
	        var cmp = comparePoints(range.end, next.start);
	        if (cmp < 0)
	            continue;

	        if (cmp == 0 && !range.isEmpty() && !next.isEmpty())
	            continue;

	        if (comparePoints(range.end, next.end) < 0) {
	            range.end.row = next.end.row;
	            range.end.column = next.end.column;
	        }

	        list.splice(i, 1);
	        removed.push(next);
	        next = range;
	        i--;
	    }

	    return removed;
	  },

	  getMarkerColorName: function(marker){
	    var s =marker.clazz
	      , hclass="ace_highlight marker-";

	    return s.substring((s.indexOf(hclass) + hclass.length),s.length);
	  },

	  getOccurences: function(){
	    var markers = this.getHighlightMarkers()
	      , occurences = {};

	    this.colors.forEach(function(c){
	      occurences[c.color] = {};
	    });

	    markers.forEach(function(marker){
	      var colorName = this.getMarkerColorName(marker)
	      , text = this.aceEditSession.getTextRange(marker.range)
	      , ocColor = occurences[colorName];
	      
	      if(! ocColor.hasOwnProperty(text)){
	        ocColor[text] = 0;
	      }
	      ocColor[text]++;
	    }.bind(this));

	    return occurences;
	  },

	  _modeChanged: function(newValue, oldValue){
	  	if(oldValue === newValue) return;
	    if(this.modes && this.modes[newValue]){
	      this.modes[newValue]();
	    }
	  },

	  setInEditTextMode: function(){
	    this.mode = this.MODE_EDIT_TEXT;
	    this.removeAllMarkers();
	    this.editor.setReadOnly(false);
	    this.aceEditSession
	      .selection.off('changeSelection', this.onChangeSelectionBinded);
	  },

	  setInHeatmapMode: function(){
	    this.mode = this.MODE_HEATMAP;
	    this.removeAllMarkers();
	    this.editor.setReadOnly(true);
	    this.aceEditSession
	      .selection.off('changeSelection', this.onChangeSelectionBinded);
	  },

	  setInHighlightMode: function(){
	    this.mode = this.MODE_HIGHLIGHT;
	    this.removeAllMarkers();
	    this.editor.setReadOnly(true);
	    this.aceEditSession
	      .selection.on('changeSelection', this.onChangeSelectionBinded);
	  },

	  /**
	  * Set Coloring or Erasing mode
	  * 
	  */
	  setHighlightMode: function (mode) {
	    if (this.highlightMode == mode) return;
	    var isColor = ((this.highlightMode = mode) == this.HIGHLIGHT_COLOR);
	  },

	 /**
	  * Adds a new Marker to the aceEditSession
	  * 
	  */
	  addMarker: function (markRange, clazz) {
	   return this.aceEditSession.addMarker(markRange, clazz, 'text', false);
	  },

	  getHighlightMarkers: function (){
			var markers = [];
			var m = this.aceEditSession.getMarkers();

			for (var k in m){
				if(m[k].clazz.indexOf("ace_highlight") != -1){
					markers.push(m[k]);
				}
			}
			return markers;
	  },

	  getHighlightRanges: function (){
	     var hMarkers = this.getHighlightMarkers()
	      , hRanges = {}
	      , self = this;

	     hMarkers.forEach(function(v){
	      var colorStr = self.getMarkerColorName(v)
	        , hclass="ace_highlight";

	      if(! hRanges.hasOwnProperty(colorStr) ){
	        hRanges[colorStr] = [];
	      }
	      hRanges[colorStr].push(v.range)
	      
	    });

	    Object.keys(hRanges).forEach(function(hKey){
	    	var hrange = hRanges[hKey];
	    	hRanges[hKey] = hrange.sort(function(a, b) {
	    	    return comparePoints(a.start, b.start);
	    	});

	    })

	    return hRanges;
	  },


	  /**
	  * Handles changeSelection events
	  * 
	  */
	  onChangeSelection: function(e) {
	    setTimeout(function(e){
	      if (this.aceEditSession.selection.isEmpty() 
	        || isEmptyObject(this.colors)) return;
	      
	      this.highlightMode == this.HIGHLIGHT_COLOR ?   this.highlightChange() : this.eraseChange();
	    }.bind(this,e), 1)
	  },

	  highlightChange: function(){
	    var selRange = this.aceEditSession.selection.getRange()
	      , markers = this.aceEditSession.getMarkers();

	    this.lastMarker = this.addMarker(selRange, 'ace_highlight marker-' + this.selectionColor.color);
	    selRange.id = this.lastMarker;
	    this.addRangeItem(markers[this.lastMarker], this.lastMarker, this.selectionColor.color);
	    this.mergeColor(this.selectionColor.color);

	    this.populateOccurenceItems();
	  },

	  /**
	  * Remove all markers
	  * 
	  */
	  removeAllMarkers: function(){

	    var markers = this.aceEditSession.getMarkers();
	    
	    for (var id in markers){
	      if(markers[id].clazz.indexOf('ace_highlight') != -1){
	        this.aceEditSession.removeMarker(id);
	      }
	    }

	    this.rangeItems = [];
	    this.occurenceItems = [];
	    this.heatmapItems = [];
	  },


	  /**
	  * Erases Markers
	  * 
	  */
	  eraseChange: function(){
	    var eraserRange = this.aceEditSession.selection.getRange() 
	      , markers = this.getHighlightMarkers()
	      , removed = []
	      , self=this;

	    //keep in mind that 'return' statements inside
	    // forEach callbacks work as 'continue' statements
	    markers.forEach( function(m){
	      var range = m.range;

	      // can touch this (...range since they do not intersect)!
	      if (!range.intersects(eraserRange)) return;

	      if(range.isEqual(eraserRange) || eraserRange.containsRange(range)){
	        //remove range
	        self.aceEditSession.removeMarker(range.id);
	        self.removeRangeItemByMarkerId(m.id)
	        removed.push(range) 
	        return;
	      }

	      if(range.containsRange(eraserRange)){
	        //create the ending marker
	        var range2 = new Range(eraserRange.end.row, eraserRange.end.column , range.end.row , range.end.column);
	        var newMarkerId2 = self.addMarker(range2, m.clazz);
	        range2.id = newMarkerId2;
	        self.addRangeItem(self.aceEditSession.getMarkers()[newMarkerId2], newMarkerId2, self.selectionColor.color);

	        range.end.row = eraserRange.start.row;
	        range.end.column = eraserRange.start.column;
	      }else{
	        /*
	       * * `-1`: (B) begins before (A) but ends inside of (A)<br/>
	       * * `+1`: (B) begins inside of (A) but ends outside of (A)<br/>
	       * * `42`: FTW state: (B) ends in (A) but starts outside of (A) */
	        switch(range.compareRange(eraserRange)){
	          case -1:
	              range.start.row = eraserRange.end.row;
	              range.start.column = eraserRange.end.column;
	            break;
	          case 1:
	              range.end.row = eraserRange.start.row;
	              range.end.column = eraserRange.start.column;
	            break;
	          case 42:
	              range.end.row = eraserRange.end.row;
	              range.end.column = eraserRange.end.column;
	            break;
	        }
	      }

	      self.aceEditSession.removeMarker(range.id);
	      self.removeRangeItemByMarkerId(m.id);
	      removed.push(range) 
	      var newMarkerId = self.addMarker(range, m.clazz)
	      range.id = newMarkerId;
	      self.addRangeItem(self.aceEditSession.getMarkers()[newMarkerId], newMarkerId, self.selectionColor.color);
	      return;

	    });

	    self.mergeByColor();
	    return removed;
	  },


	  // rangeMinus: function(range1, range2) {
	  //   var resultstart, resultend;
	   
	  //   if ((range1.start.row == range2.start.row) && (range1.start.column == range2.start.column)) {
	  //       resultstart = minimum(range1.end, range2.end);
	  //       resultend = maximum(range1.end, range2.end);
	        
	  //   } else { //MARGARITA  do you need the if inside the else here?
	  //       if ((range1.end.row == range2.end.row) && (range1.end.column == range2.end.column)) {
	  //       resultstart = minimum(range1.start, range2.start);
	  //       resultend = maximum(range1.start, range2.start);
	        
	  //       }
	  //   }

	  //   return new Range(resultstart.row, resultstart.column,
	  //                    resultend.row, resultend.column);
	  // },

	  populateOccurenceItems: function(){
	    var occurences = this.getOccurences();
	    this.occurenceItems = [];
	    for (var color in occurences){
	      for (var s in occurences[color]){
	        this.addOccurenceItem(color, s, occurences[color][s]);
	      }
	    }
	  },

	  addOccurenceItem: function(color, text, count) {
	    var occurenceItemObj = {
	      colorClass: 'marker-' + color,
	      summary: truncate(text, 30,'…'),
	      text: text,
	      occurences: count
	    }
	    this.push('occurenceItems', occurenceItemObj);
	  },

	  addRangeItem: function(marker, id, color) {
	    var self = this
	      , rangeString = marker.range.start.row + ':' + marker.range.start.column
	        + ' - ' + marker.range.end.row + ':' + marker.range.end.column
	      , text = this.aceEditSession.getTextRange(marker.range);

	    var rangeItemObj = {
	      id: this.rangeIdPrefix+id ,
	      colorClass: 'marker-' + color,
	      summary: truncate(text, 30,'…'),
	      text: text,
	      range: rangeString
	    }

	    this.push('rangeItems',rangeItemObj);
	  },

	  updateRangeItemTextByMarkerId: function(id, text){
	  	var items = this.rangeItems;

	  	for (var i=0, l= items.length; i<l; i++){
	  		if(items[i].id ==  this.rangeIdPrefix+id){
	  			//need to do it this way for polymer
	  			this.set('rangeItems.'+ i +'.summary', truncate(text, 30,'…'));
	  			this.set('rangeItems.'+ i +'.text', text);
	  			return;
	  		}
	  	}
	  },

	  removeRangeItemByMarkerId: function(id) {
	  	var items = this.rangeItems;
	  	for (var i=0, l= items.length; i<l; i++){
	  		if(items[i].id ==  this.rangeIdPrefix+id){
	  			this.splice('rangeItems', i, 1);
			  	//update Occurence Items
			  	this.populateOccurenceItems();
	  			return;
	  		}
	  	}

	  },

	  addHeatmapItem: function(hue){
	    var self = this;
	    var heatmapItemObj = {
	      hue: hue,
	      colorClass: 'marker-' + hue,
	      description: hue
	    }

	    this.push('heatmapItems', heatmapItemObj);
	  },

	  updateHeatmapData: function(ranges){
	  	if(! this.aceEditSession){
	  		return;
	  	}

	    this.removeAllMarkers();
	    var hmap = new Heatmap({
	      textLines: this.aceEditSession.getDocument().getAllLines()
	    });

	    // ranges = JSON.parse(ranges);
      hmap.addHueRanges(ranges);
      this.heatmapData = hmap.hues;

      for(var hue in this.heatmapData){
        this.addHeatmapItem(hue);
      }

	    try{
	      
	     // $('heatmap-labels a.list-group-item:first').trigger('click')
	    }catch(err){
	      console.log("Error parsing ranges", err)
	    }
	  },

	  drawHeatmap: function(hue){
	  	this.removeAllMarkers();

	    if(! this.heatmapData[hue]){
	      throw new Error('no heatmatData found for hue ' + hue);
	    }
	    var hueData = this.heatmapData[hue];

	    for(var i = 0, lrow = hueData.weights.length; i < lrow; i++){
	      for(var j = 0, lcol = hueData.weights[i].length; j < lcol; j++){
	        var val = ~~(hueData.weights[i][j] * 10);
	        if(val == 0) continue;
	        var range = new Range(i, j, i, j+1);
	        this.addMarker(range, 'ace_highlight marker-' + hue + '-' + val);
	      }
	    }
	  },

	  drawSolution: function(solution){
	  	if(! this.aceEditSession){
	  		return;
	  	}

	    this.removeAllMarkers();

	    Object.keys(solution).forEach(function(key){
	    	var colorRanges = solution[key];
	    	colorRanges.forEach(function(range){
	    		var range = new Range(range.start.row, range.start.column, range.end.row, range.end.column);
	    		var newMarkerId = this.addMarker(range, 'ace_highlight marker-' + key);
	    		range.id = newMarkerId;
	    		this.addRangeItem(this.aceEditSession.getMarkers()[newMarkerId], newMarkerId, key);
	    		this.populateOccurenceItems();
	    	}.bind(this));
	    }.bind(this));
	  }

	});

	//copied from http://aganov.github.io/underscore-strings/docs/underscore.strings.html
	function truncate(string, length, truncation) {
	  length = length || 30;
	  truncation = ("undefined" == typeof truncation || truncation == null) ? '...' : truncation;
	  return (string.length > length 
	  	? string.slice(0, length - truncation.length) + truncation 
	  	: String(string));
	}

	function minimum (pos1, pos2) {
	  if (pos1.row == pos2.row){
	    return pos1.column <= pos2.column ? pos1 : pos2;
	  }

	  return pos1.row < pos2.row ? pos1 : pos2;
	}

	function maximum (pos1, pos2) {

	  if (pos1.row == pos2.row){
	    return pos1.column >= pos2.column ? pos1 : pos2;
	  }

	  return pos1.row > pos2.row ? pos1 : pos2;
	}

	function isEmptyObject( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	}

})();
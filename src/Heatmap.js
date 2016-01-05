"use strict";

var Heatmap = module.exports = function(options){
  this.init(options);
}

;(function(){

  this.init = function(options){
    this.hues = Object.create(null);
    this.emptyLinesArray = options.textLines.slice(0);

    //replace text in textlines with an array of 0 to measure frequency
    var i = options.textLines.length;
    var lol;
    while(i--){

      this.emptyLinesArray[i] = [];
      var j = options.textLines[i].length;
      while(j--){
        this.emptyLinesArray[i].push(0);
      }
    }
  }

  this.addHueRanges = function(ranges){
    if(! (ranges instanceof Array) ){
      throw new Error("ranges argument should be an array");
    }
    var i = ranges.length;
    while(i--){
      this.addRange(ranges[i]);
    }      
  };

  this.addRange = function(hueRanges){
    for (var key in hueRanges){
      if(hueRanges.hasOwnProperty(key)){
        this.addRangesForHue(key, hueRanges[key])
      }
    }
  }

  this.addRangesForHue = function(hue, ranges){
    if("undefined" === typeof hue || "string" != typeof hue){
      throw new Error('argument hue should be a valid string');
    }
    if("undefined" === typeof ranges 
      || ! (ranges instanceof Array) 
      || ! ranges.length ){
        throw new Error('argument ranges should be a valid Array instance');
    }

    if(! this.hues[hue]){
      //use JSON parse and stringify for an easy clone :-)
      this.hues[hue] = { weights: JSON.parse(JSON.stringify(this.emptyLinesArray)), n : 0}
    }


    var hueWeights = this.hues[hue].weights
      , n = ++this.hues[hue].n
      //, i = ranges.length;
      , rIndex = 0
      , range = ranges[rIndex];


    // ranges are ordered so we go thrould all the text lines adding ones if the current
    // range containes the current index and zeros if the current index is between two
    // not overlapping ranges
    for(var i = 0, lrow = hueWeights.length; i < lrow; i++){
      // check if we need to move to the next range based on row
      if (range.end.row < i){
        if(rIndex == ranges.length - 1) break;
        range = ranges[++rIndex];
      }

      for (var j=0, lcol = hueWeights[i].length; j < lcol; j++){
        // check if we need to move to the next range based on column
        if (range.end.row == i && range.end.column < j ){
          if(rIndex == ranges.length - 1) break;
          range = ranges[++rIndex];
        }

        //check if element is between range
        // TODO: consider using the build Range methods like contains
        if(i > range.start.row && i < range.end.row){
          hueWeights[i][j] = hueWeights[i][j] + (1 - hueWeights[i][j]) / n;
        }else if(i == range.start.row && j >= range.start.column && j < range.end.column
          || i == range.end.row && j >= range.start.column && j < range.end.column){
          hueWeights[i][j] = hueWeights[i][j] + (1 - hueWeights[i][j]) / n;
        }
        else{
          hueWeights[i][j] = hueWeights[i][j] -  hueWeights[i][j] / n;
        }

      }
    }
  };


}).call(Heatmap.prototype);
    

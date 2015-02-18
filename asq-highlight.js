'use strict';

(function(){
  var p = {

    publish:{
      mode: {value: 'java', reflect: true},
      theme: {value: 'textmate', reflect: true}
    },
    
    created: function(){
      this.statusMessage = '';
      this.displayMode = 'heatmap';
      this.palette = [];
    },

    //This is necessary in case the codeEditor get's reattached to the DOM after `this`
    attached: function(){
      var code = this.querySelector("code");
      if(code){
        this.$.codeEditor.value = code.textContent;
      }
    },

    ready: function(){
      var code = this.querySelector("code");
      if(code){
        this.$.codeEditor.textContent = code.textContent;
      }

      this.populatePalette();
      
      this.aceHighlightManagerModes = {
        "presenter" : this.$.aceHighlightManager.MODE_HEATMAP,
        "viewer" : this.$.aceHighlightManager.MODE_HIGHLIGHT
      }

      this.$.aceHighlightManager.mode = this.aceHighlightManagerModes[this.role];

      //override roleChanged
      var orig = this.roleChanged;
      this.roleChanged = function(old, newRole){
        orig.apply(this, arguments);
        this.$.aceHighlightManager.mode = this.aceHighlightManagerModes[newRole];
      }

      document.addEventListener('asq-ready', function(evt){
        try{
          this.subscribeToEvents(evt.detail.asqEventBus);
        }catch(err){
          console.debug('failed to subscribeToEvents');
        }
      }.bind(this));
    },

    populatePalette: function(){
      var tasks= this.querySelectorAll('asq-hl-color-task');
      this.palette = Array.prototype.map.call(tasks, function(task){
        return {
          "color" : task.color,
          "name" : task.colorName
        }
      }) ;
    },

    displayModeChanged: function(oldVal, newVal){
      if (newVal =='heatmap'){
        this.$.taskSelector.multi = false;
        this.showHeatmap();

      }else if (newVal =='solution'){
        this.$.taskSelector.multi = true;
        this.showSolution();
      }
    },

    onQuestionType: function(evt){
      if(evt && evt.questionType && evt.questionType == this.tagName.toLowerCase()){
        if(evt.type == "progress"){
          this.onProgress(evt);
        }
      }
    },

    onProgress: function(evt){
      if(evt.questionUid !== this.uid) return;
      if(this.role !== this.roles.PRESENTER) return;
      this.updateProgress(evt.heatmapData)
    },

    updateProgress: function(heatmapData){
      this.$.aceHighlightManager.updateHeatmapData(heatmapData)
    },

    setHighlightMode: function(event, detail, sender){
      // already active
      if (sender.isActive()) return;
      
      sender.setActive(true);
      this.$.eraseBtn.removeAttribute("active") 
      this.$.aceHighlightManager.setHighlightMode(this.$.aceHighlightManager.HIGHLIGHT_COLOR);
    },

    setEraseMode: function(event, detail, sender){
      // already active
      if (sender.hasAttribute("active")) return;
      
      sender.setAttribute("active", ''); 
      this.$.colorPalette.setActive(false);
      this.$.aceHighlightManager.setHighlightMode(this.$.aceHighlightManager.HIGHLIGHT_ERASE);
    },

    onHeatmapBtnClick: function(event, detail, sender){
      this.displayMode = "heatmap";
    },

    onSolutionBtnClick: function(event, detail, sender){
      this.displayMode = "solution";
    },

    showHeatmap: function(){
      this.updateProgress([{"d9534f":[{"start":{"row":"0","column":"0"},"end":{"row":"0","column":"6"},"id":"42"},{"start":{"row":"1","column":"2"},"end":{"row":"1","column":"8"},"id":"48"}]},{"d9534f":[{"start":{"row":"0","column":"0"},"end":{"row":"0","column":"6"},"id":"42"}]},{"f0ad4e":[{"start":{"row":2,"column":4},"end":{"row":2,"column":7},"id":8}]},{"f0ad4e":[{"start":{"row":2,"column":4},"end":{"row":2,"column":7},"id":8},{"start":{"row":2,"column":22},"end":{"row":2,"column":25},"id":13},{"start":{"row":2,"column":35},"end":{"row":2,"column":38},"id":19}]  }]);
      
      var selectedItem = this.$.taskSelector.selectedItem;

      if(! selectedItem) return;

      this.statusMessage = "Heatmap for " + selectedItem.textContent;

      try{
        this.$.aceHighlightManager.drawHeatmap(selectedItem.color)
      }catch(err){
        // maybe there's just no data
        if(err.message && err.message.match(/no heatmatData found for hue/)){
        }else{
          throw(err);
        }
      }
    },

    showSolution: function(event, detail, sender){
      var solution = {"d9534f":[{"start":{"row":0,"column":0},"end":{"row":0,"column":6},"id":8},{"start":{"row":1,"column":1},"end":{"row":1,"column":7},"id":15}],"428bca":[{"start":{"row":2,"column":3},"end":{"row":2,"column":6},"id":21}],"f0ad4e":[{"start":{"row":0,"column":7},"end":{"row":0,"column":12},"id":30},{"start":{"row":1,"column":8},"end":{"row":1,"column":12},"id":37},{"start":{"row":2,"column":21},"end":{"row":2,"column":24},"id":44},{"start":{"row":2,"column":34},"end":{"row":2,"column":37},"id":50}]};
      var appliedSolution = {};
      this.statusMessage = "Solution for";

      // since taskSelector has a `multi` attribute for solution mode
      // selectedItem is an array
      var selectedItem = this.$.taskSelector.selectedItem;

      if(!selectedItem){
        selectedItem = [];
      }

      if(! (selectedItem instanceof Array)){
        selectedItem = [selectedItem];
      }

      if(selectedItem.length){
        var colors = selectedItem.map(function(item, idx){
          if(idx == 0){
            this.statusMessage += ' '
          }
          else if(idx < (selectedItem.length - 1)){
             this.statusMessage += ', '
          }else{
            this.statusMessage += ' and '
          }

          this.statusMessage += item.textContent;
          return item.color;
        }.bind(this));
        colors.forEach(function(c){
          if(solution.hasOwnProperty(c)){
            appliedSolution[c] = solution[c].slice();
          }
        })
      }else{
        appliedSolution = solution;
        this.statusMessage = "Solution for all";
      }      

      this.$.aceHighlightManager.drawSolution(appliedSolution);
    },

    submit: function() {
      if ( this.role !== this.roles.VIEWER ) {
        return;
      }

      var submission = this.$.aceHighlightManager.getHighlightRanges();

      return {
        questionUid: this.uid,
        timestamp: new Date(),
        submission: submission
      };
    },

    subscribeToEvents: function(eventBus){
      eventBus.on('asq:question_type', this.onQuestionType.bind(this))
    },

    onSelectedTaskChanged: function(event, detail, sender){

      if(this.displayMode == 'heatmap'){
        this.showHeatmap();
      }else if(this.displayMode == 'solution'){
        this.showSolution();
      }
     
    }
  }

  ASQ.mixin2(p, ASQ.RoleMixin);
  Polymer.mixin(p, ASQ.ElementTypeMixin, ASQ.QuestionTypeMixin);
  Polymer('asq-highlight', p);
})();

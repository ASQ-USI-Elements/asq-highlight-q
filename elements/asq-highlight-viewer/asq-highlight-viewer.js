'use strict';

(function(){
  var p = {

    publish:{
      mode: {value: 'java', reflect: true},
      theme: {value: 'textmate', reflect: true},
      fontSize: {value: '12px', reflect: true}
    },

    initAceElement: function(){
      var code = this.$.codeContent.getDistributedNodes()[0]; 
      if(code){
        this.$.codeEditor.textContent = code.textContent;
        this.$.codeEditor.initializeEditor();
      } 
    },
   
    created: function(){
      this.palette = [];
    },

    domReady: function(){
      this.initAceElement();
      this.populatePalette();
    },

    ready: function(){

      this.$.aceHighlightManager.mode = this.$.aceHighlightManager.MODE_HIGHLIGHT;

      document.addEventListener('asq-ready', function(evt){
        try{
          this.subscribeToEvents(evt.detail.asqEventBus);
        }catch(err){
          console.debug('failed to subscribeToEvents');
        }
      }.bind(this));
    },

    populatePalette: function(){
      var tasks= this.$.tasksContent.getDistributedNodes();
      this.palette = Array.prototype.map.call(tasks, function(task){
        return {
          "color" : task.color,
          "name" : task.colorName
        }
      }) ;
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


    submit: function() {
      var submission = this.$.aceHighlightManager.getHighlightRanges();

      return {
        questionUid: this.uid,
        timestamp: new Date(),
        submission: submission
      };
    },

    subscribeToEvents: function(eventBus){
    }
  }

  ASQ.asqify(p, true);
  Polymer('asq-highlight-viewer', p);
})();

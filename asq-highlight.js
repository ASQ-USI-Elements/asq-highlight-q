'use strict';

(function(){
  var p = {

    publish:{
      mode: {value: 'java', reflect: true},
      theme: {value: 'textmate', reflect: true},
      fontSize: {value: '12px', reflect: true}
    },

    ready: function(){

      document.addEventListener('asq-ready', function(evt){
        try{
          this.subscribeToEvents(evt.detail.asqEventBus);
        }catch(err){
          console.debug('failed to subscribeToEvents');
        }
      }.bind(this));
    },

    subscribeToEvents: function(eventBus){
    }
  }

  ASQ.asqify(p, true);
  Polymer('asq-highlight', p);
})();

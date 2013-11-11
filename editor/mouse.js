Mouse = new Class({
    Implements: Events,
    modes: {
        normal: true,
        link: false
    },

    initialize: function() {

    },

    addEventByMode: function(element, mode, event, fn) {
        console.log(event);
        element.on(event, function(evt) {
            if (this.modes[mode] == true) {
                fn(evt);
            }
        }.bind(this));
    }


});
Mouse = new Class({
    Implements: Events,
    modes: {
        normal: true,
        link: false,
        tile: false
    },

    initialize: function() {

    },

    addEventByMode: function(element, mode, event, fn) {
        element.on(event, function(evt) {
            if (this.modes[mode] == true) {
                fn(evt);
            }
        }.bind(this));
    },

    setMouseMode: function(mode) {
        var obj  = Object.clone(this.modes);
        Object.each(obj, function(item, index) {
            if (index == mode) {
                obj[mode] = true;
            } else {
                obj[index] = false;
            }
        });
        this.modes = obj;
    }


});
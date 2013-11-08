
Window = new Class({

    Extends: Drag,
    Implements: Events,
    element: null,
    buttons: {
        'minimize': null,
        'maximize': null
    },

    initialize: function(element, options) {
        this.parent(element, options);
        this.element = element;
        this.buttons.minimize = this.element.getElement('.minimize');
        this.buttons.maximize = this.element.getElement('.maximize');
        this.addEvents();
    },

    addEvents: function() {
        this.buttons.minimize.addEvent('click', function() {
            this.element.setStyle('height', 30);
        }.bind(this));

        this.buttons.maximize.addEvent('click', function() {
            this.element.setStyle('height', 500);
        }.bind(this));
        var self = this;
        this.element.getElements('li').addEvent('click', function(event) {
            console.log('click');
            self.fireEvent('clicked', this);
        });
    }
});
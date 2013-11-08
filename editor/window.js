(function (window) {
    function Window() {
        this.initialize();
    }

    // initialize the object
    Window.prototype.initialize = function () {
        this.name = 'Window';
    }

    Window.prototype.addEvents = function() {
        
    }

    window.Window = Window;
} (window));
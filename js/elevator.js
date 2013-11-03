(function (window) {
    function Elevator(image, maxValues, startVelocity) {
        this.initialize(image, maxValues, startVelocity);
    }

    Elevator.prototype = new createjs.Bitmap();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    Elevator.prototype._initialize = Elevator.prototype.initialize;

    // initialize the object
    Elevator.prototype.initialize = function (image, maxValues, startVelocity) {
        this._initialize(image);
        this.name = 'Elevator';
        this.snapToPixel = true;
        this.maxValues = maxValues;
        this.velocity = {
            x: 0,
            y: startVelocity
        }
        this.on('tick', this.tick);
    }

    Elevator.prototype.tick = function() {
        if (this.y > this.maxValues.maxY) {
            this.velocity.y = -1;
        }
        if (this.y < this.maxValues.minY) {
            this.velocity.y = 1;
        }

        this.y += this.velocity.y;
    }

    window.Elevator = Elevator;
} (window));
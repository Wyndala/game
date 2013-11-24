(function (window) {
    function Elevator(image, maxValues, startVelocity) {
        this.initialize(image, maxValues, startVelocity);
    }

    Elevator.prototype = new createjs.Sprite();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    Elevator.prototype._initialize = Elevator.prototype.initialize;

    // initialize the object
    Elevator.prototype.initialize = function (image, maxValues, startVelocity) {
        if (typeof startVelocity == 'undefined') {
            startVelocity = 1;
        }
        var data = {
            images: [image],
            frames: {
                width:155,
                height:25
            },
            animations: {
                normal: [0,5, 'normal', 0.15]
            }
        };
        var spriteSheet = new createjs.SpriteSheet(data);
        this._initialize(spriteSheet, 'normal');
        this.name = 'elevator';
        this.snapToPixel = true;
        this.maxValues = maxValues;

        this.velocity = {
            x: 1,
            y: startVelocity
        }
        this.on('tick', this.tick);
    }

    Elevator.prototype.tick = function() {
        if (this.y > this.maxValues.maxY) {
            this.velocity.y = -this.velocity.y ;
        }
        if (this.y < this.maxValues.minY) {
            this.velocity.y = -this.velocity.y ;
        }

        this.y += this.velocity.y;
    }

    window.Elevator = Elevator;
} (window));
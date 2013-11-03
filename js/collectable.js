(function (window) {
    function Collectable(image) {
        this.initialize(image);
    }

    Collectable.prototype = new createjs.Sprite();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    Collectable.prototype._initialize = Collectable.prototype.initialize;

    // initialize the object
    Collectable.prototype.initialize = function (image) {
        var data = {
            images: [image],
            frames: {
                width:20,
                height:24,
                regX: 00,
                regY: 0
            },
            animations: {
                normal:  {
                    frames: [0,1,2,3,2,1,0],
                    speed: 0.1
                }
            }
        };
        var spriteSheet = new createjs.SpriteSheet(data);

        this._initialize(spriteSheet, 'normal');
        this.name = 'Collectable';
        this.snapToPixel = true;
    }

    Collectable.prototype.collect = function() {
        stage.removeChild(this);
        createjs.Sound.play('coin');
        collects++;
    }

    window.Collectable = Collectable;
} (window));
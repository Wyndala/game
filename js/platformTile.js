(function (window) {
    function PlatformTile(direction) {
        this.initialize(direction);
    }

    PlatformTile.prototype = new createjs.Sprite();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    PlatformTile.prototype._initialize = PlatformTile.prototype.initialize;

    // initialize the object
    PlatformTile.prototype.initialize = function (direction) {
        var data = {
            images: ['assets/platformTile.png'],
            frames: {
                width:110,
                height:25
            },
            animations: {
                leftUp: [0],
                Up: [1],
                rightUp: [2],
                left: [3],
                middle: [4],
                right: [5],
                leftDown: [3],
                Down: [4],
                rightDown: [5]
            }
        };
        var spriteSheet = new createjs.SpriteSheet(data);

        if (!spriteSheet.complete) {
            var self = this;
            spriteSheet.addEventListener("complete", function() {
                self.dispatchEvent("completeLoading");
            });
        } else {
            this.dispatchEvent("completeLoading");
        }

        this._initialize(spriteSheet, direction);
        this.stop();
        this.name = 'PlatformTile';
        this.snapToPixel = true;
    }

    window.PlatformTile = PlatformTile;
} (window));
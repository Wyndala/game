(function (window) {
    function GroundTile(direction) {
        this.initialize(direction);
    }

    GroundTile.prototype = new createjs.Sprite();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    GroundTile.prototype._initialize = GroundTile.prototype.initialize;

    // initialize the object
    GroundTile.prototype.initialize = function (direction) {
        var data = {
            images: ['assets/groundTilesBig.png'],
            frames: {
                width:30,
                height:30
            },
            animations: {
                leftUp: [0],
                Up: [1],
                rightUp: [2],
                left: [3],
                middle: [4],
                right: [5],
                leftDown: [6],
                Down: [7],
                rightDown: [8]
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
        this.name = 'GroundTile';
        this.snapToPixel = true;
    }

    window.GroundTile = GroundTile;
} (window));
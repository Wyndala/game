(function (window) {
    function GroundContainer(options) {
        this.initialize(options);
    }

    GroundContainer.prototype = new createjs.Container();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    GroundContainer.prototype._initialize = GroundContainer.prototype.initialize;

    /**
     * options = width, height, style
     * @param options
     */
    GroundContainer.prototype.initialize = function (options) {
        this._initialize();
        this.name = 'ground';
        this.snapToPixel = true;
        this.options = options;
        this.buildContainer();
    }

    GroundContainer.prototype.buildContainer = function () {
        var tileCountWidth = Math.round(this.options.width / 30);
        var tileCountHeight = Math.round(this.options.height / 30);
        var tilesToLoad = tileCountWidth * tileCountHeight;

        for (var y=0; y < tileCountHeight; y++) {
            for (var x=0; x < tileCountWidth; x++) {
                var tile = new GroundTile(this.getStyleTile(x, y, tileCountWidth, tileCountHeight));

                if (x===0 && y === 0) {
                    var self = this;
                    tile.on('completeLoading', function() {
                        tilesToLoad--;
                        if (tilesToLoad === 0) {
                            self.dispatchEvent('completeLoading');
                        }
                    })
                }

                tile.x = x * 30;
                tile.y = y * 30;
                this.addChild(tile);
            }
        }
    }

    GroundContainer.prototype.getStyleTile = function (x,y, tileCountWidth, tileCountHeight) {
        if (this.options.style) {
            if (this.options.style == 'grassUp') {
                return this.getStyleGrassUp(x,y);
            } else if (this.options.style == 'fullRect') {
                return this.getStyleFullRect(x, y, tileCountWidth, tileCountHeight);
            }
        } else {
            return 'Up';
        }
    }

    GroundContainer.prototype.getStyleGrassUp = function(x, y) {
        if (y === 0) {
            return 'Up'
        } else {
            return 'middle';
        }
    }

    GroundContainer.prototype.getStyleFullRect = function(x, y, tileCountWidth, tileCountHeight) {
        if (x === 0 && y === 0) {
            return 'leftUp'
        } else if (x === tileCountWidth - 1 && y === 0) {
            return 'rightUp'
        } else if (y === 0) {
            return 'Up'
        } else if (x === 0 && y !== tileCountHeight - 1) {
            return 'left'
        } else if (x === tileCountWidth - 1 && y !== tileCountHeight - 1) {
            return 'right'
        } else if (x === 0 && y === tileCountHeight - 1) {
            return 'leftDown'
        } else if (x === tileCountWidth - 1 && y === tileCountHeight - 1) {
            return 'rightDown'
        } else if (y === tileCountHeight - 1) {
            return 'Down'
        } else {
            return 'middle';
        }
    }

    window.GroundContainer = GroundContainer;
} (window));
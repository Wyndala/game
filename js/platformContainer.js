(function (window) {
    function PlatformContainer(options) {
        this.initialize(options);
    }

    PlatformContainer.prototype = new createjs.Container();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    PlatformContainer.prototype._initialize = PlatformContainer.prototype.initialize;

    /**
     * options = width, height, style
     * @param options
     */
    PlatformContainer.prototype.initialize = function (options) {
        this._initialize();
        this.name = 'platformContainer';
        this.snapToPixel = true;
        this.options = options;
        this.buildContainer();
    }

    PlatformContainer.prototype.buildContainer = function () {
        var tileCountWidth = Math.round(this.options.width / 110);
        var tileCountHeight = Math.round(this.options.height / 25);
        var tilesToLoad = tileCountWidth * tileCountHeight;

        for (var y=0; y < tileCountHeight; y++) {
            for (var x=0; x < tileCountWidth; x++) {
                var tile = new PlatformTile(this.getStyleTile(x, y, tileCountWidth, tileCountHeight));

                if (x===0 && y === 0) {
                    var self = this;
                    tile.on('completeLoading', function() {
                        tilesToLoad--;
                        if (tilesToLoad === 0) {
                            self.dispatchEvent('completeLoading');
                        }
                    })
                }

                tile.x = x * 110;
                tile.y = y * 25;
                this.addChild(tile);
            }
        }
    }

    PlatformContainer.prototype.getStyleTile = function (x,y, tileCountWidth, tileCountHeight) {
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

    PlatformContainer.prototype.getStyleGrassUp = function(x, y) {
        if (y === 0) {
            return 'Up'
        } else {
            return 'middle';
        }
    }

    PlatformContainer.prototype.getStyleFullRect = function(x, y, tileCountWidth, tileCountHeight) {
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

    window.PlatformContainer = PlatformContainer;
} (window));
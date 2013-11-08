(function (window) {
    function Interactor(image) {
        this.initialize(image);
    }

    Interactor.prototype = new createjs.Sprite();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    Interactor.prototype._initialize = Interactor.prototype.initialize;

    // initialize the object
    Interactor.prototype.initialize = function (image) {
        var data = {
            images: [image],
            frames: {
                width:30,
                height:30,
                regX: 00,
                regY: 0
            },
            animations: {
                active:  {
                    frames: [1,2,3],
                    speed: 0.05
                },
                inactive: [0]
            }
        };
        var spriteSheet = new createjs.SpriteSheet(data);
        this._initialize(spriteSheet, "active");
        this.name = 'Interactor';
        this.snapToPixel = true;
    }

    Interactor.prototype.activate = function() {
        var data = {
            images: ['assets/appleSprite.png'],
            frames: {
                width:24,
                height:72
            },
            animations: {
                active: {
                    frames: [0,1, 2],
                    speed: 0.45
                }
            }
        };
        var coinSheet = new createjs.SpriteSheet(data);
        var coin = new createjs.Sprite(coinSheet, 'active');
        coin.x = this.x + 5;
        coin.y = this.y - 80;

        coin.on('animationend', function() {
            coin.stop();
            stage.removeChild(coin);
        });

        stage.addChild(coin);
        createjs.Sound.play('coin');
        this.gotoAndPlay('inactive');
        collects++;
        hud.update();
    }

    window.Interactor = Interactor;
} (window));
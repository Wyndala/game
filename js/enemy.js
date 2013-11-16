(function (window) {
    function Enemy(image, platform) {
        this.initialize(image, platform);
    }

    Enemy.prototype = new createjs.Sprite();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    Enemy.prototype._initialize = Enemy.prototype.initialize;

    // initialize the object
    Enemy.prototype.initialize = function (image, platform) {
        var data = {
            images: [image],
            frames: {
                width:16,
                height:30
            },
            animations: {
                runRight: {
                    frames: [0, 1],
                    speed: 0.2
                },
                runLeft: {
                    frames: [2, 3],
                    speed: 0.2
                },
                standRight: [0],
                standLeft: [2],
                deadRight: [0],
                deadLeft: [3]
            }
        };
        var spriteSheet = new createjs.SpriteSheet(data);
        this._initialize(spriteSheet, "runRight");
        this.name = 'enemy';
        this.snapToPixel = true;
        this.velocity = {x:2,y:0};
        this.on('tick', this.tick);
        this.killed = false;
        this.platform = platform;

    }

    // we will call this function every frame to
    Enemy.prototype.tick = function () {
        if (!this.killed) {
            var moveBy = {x:0, y:this.velocity.y};
            var plattformBounds = getBounds(this.platform) || {width: 0};
            if (this.x - this.platform.x < 0 || (this.platform.x + plattformBounds.width - this.x) < 16) {
                this.velocity.x = -this.velocity.x;
                this.playAlternateDirectionAnimation();
            }

            // moveBy is now handled by 'calculateCollision'
            // and can also be 0 - therefore we won't have to worry

            this.y += moveBy.y;

            // and now handle the x-movement
            moveBy = {x:this.velocity.x, y:0};
            this.x += moveBy.x;
        } else {
            this.velocity.y += 1;
            this.y += this.velocity.y;
            if (this.y > this.deathY) {
                stage.removeChild(this);

            }
        }
    }

    Enemy.prototype.playAlternateDirectionAnimation = function () {
        if (this.currentAnimation == 'runRight') {
            this.gotoAndPlay('runLeft');
        } else {
            this.gotoAndPlay('runRight');
        }
    }

    Enemy.prototype.kill = function () {
        if (this.currentAnimation == 'runRight') {
            this.gotoAndStop('deadLeft');
        } else {
            this.gotoAndStop('deadRight');
        }

        this.rotation = 180;
        createjs.Sound.play('stomp');
        this.velocity.x = 0;
        this.velocity.y = 10;
        this.killed = true;
        this.deathY = this.y + 1000;
    }

    window.Enemy = Enemy;
} (window));
(function (window) {
    function Hero(image) {
        this.initialize(image);
    }

    Hero.prototype = new createjs.Sprite();

    // save the original initialize-method so it won't be gone after
    // overwriting it
    Hero.prototype.Sprite_initialize = Hero.prototype.initialize;

    // initialize the object
    Hero.prototype.initialize = function (image) {
        var data = {
            images: ["assets/micha_sheet.png"],
            frames: {
                width:30,
                height:40,
                regX: 00,
                regY: 0
            },
            animations: {
                jumpRight:[5],
                jumpLeft:[4],
                runRight: {
                    frames: [2, 3],
                    speed: 0.2
                },
                runLeft: {
                    frames: [1, 0],
                    speed: 0.2
                },
                standRight: [2],
                standLeft: [1],
                crouchRight: [9],
                crouchLeft: [8],
                dead: {
                    frames: [10, 13],
                    speed: 0.2
                },
                rotate: {
                    frames: [8, 2 , 9, 1],
                    speed: 0.4
                }
            }
        };
        var spriteSheet = new createjs.SpriteSheet(data);
        this.Sprite_initialize(spriteSheet, "standRight");
        this.name = 'Hero';
        this.snapToPixel = true;
        this.setBounds ( -20,  -20,  20, 40);
        this.velocity = {x:0,y:12};
        this.oldAnimation = "standRight";
        this.onElevator = false;
        this.instance = null;

        this.walkSoundInstance = createjs.Sound.createInstance('walk');
        this.walkSoundInstance.setVolume(0.1);

    }

    // we will call this function every frame to
    Hero.prototype.tick = function () {
        this.velocity.y += 1;

        var moveBy = {x:0, y:this.velocity.y},
            collision = null,
            collideables = getCollideables(),
            collect = null,
            collectables = getCollectables();

        collision = calculateCollision(this, 'y', collideables, moveBy);
        // moveBy is now handled by 'calculateCollision'
        // and can also be 0 - therefore we won't have to worry
        this.y += moveBy.y;

        if ( !collision ) {
            if ( this.onGround && !this.onElevator) {
                this.onGround = false;
                 this.doubleJump = true;
            }
        } else {
            // the hero can only be 'onGround'
            // when he's hitting floor and not
            // some ceiling
            if ( moveBy.y >= 0 || this.onElevator) {
                this.onGround = true;
                if (this.currentAnimation == 'jumpRight') this.playAnimation(this.oldAnimation);
                if (this.currentAnimation == 'jumpLeft') this.playAnimation(this.oldAnimation);
                this.deathY = this.y + 1000;
            }
            this.velocity.y = 0;
        }

        if (this.y > this.deathY && !this.killed) {
            this.kill();
        } else if (this.y > this.deathY && this.killed) {
            reset();
        }
        // and now handle the x-movement
        moveBy = {x:this.velocity.x, y:0};
        collision = calculateCollision(this, 'x', collideables, moveBy);
        collect = calculateCollisionWithCollectables(this,collectables, moveBy);
        if (collect.length) {
            for (var i = 0; i < collect.length; i++) {
                var collectableIndex = collect[i];
                var collectable = collectables[collectableIndex];
                collectable.collect();
                hud.update();
                window.collectables.remove(collectableIndex);
            }
        };
        this.x += moveBy.x;

        if ((moveBy.x > 0 || moveBy.x < 0) && (this.onGround || this.onElevator)) {
           // console.log(this.walkSoundInstance.getPosition);
            if (!this.walkSoundInstance.getPosition()) {
                this.walkSoundInstance.play();
            }
        }
    }

    Hero.prototype.jump = function() {
        // if the hero is "on the ground"
        // let him jump, physically correct!
        if ( this.onGround ) {
            this.velocity.y = -17;
            this.onGround = false;
            this.doubleJump = true;

            createjs.Sound.play('jump');
            if (this.currentAnimation != 'jumpRight' &&
                (this.currentAnimation == 'standRight' ||
                    this.currentAnimation == 'runRight')
                ) {
                this.playAnimation('jumpRight');
            }
            if (this.currentAnimation != 'jumpLeft' &&
                (this.currentAnimation == 'standLeft' ||
                    this.currentAnimation == 'runLeft')
                ) {
                this.playAnimation('jumpLeft');
            }
        }
    }

    Hero.prototype.crouch = function() {
        if (this.currentAnimation == 'jumpRight' ||
            this.currentAnimation == 'standRight' ||
                this.currentAnimation == 'runRight'
            ) {
            this.playAnimation('rotate');
        }
        if (this.currentAnimation == 'jumpLeft' ||
            this.currentAnimation == 'standLeft' ||
                this.currentAnimation == 'runLeft'
            ) {
            this.playAnimation('rotate');
        }
    }

    Hero.prototype.playAnimation = function(animation) {
        this.oldAnimation = this.currentAnimation;
        this.gotoAndPlay(animation);
    }

    Hero.prototype.kill = function () {
        this.gotoAndPlay('dead');
        if (this.instance == null) {
            this.instance = createjs.Sound.play('die');
            backgroundInstance.stop();
            this.instance.setVolume(0.1);
        } else if (!this.instance.getPosition()) {
            this.instance = createjs.Sound.play('die');
            this.instance.setVolume(0.1);
            backgroundInstance.stop();
        }
        life--;
        hud.update();
        this.velocity.x = 0;
        this.velocity.y = -20;
        this.killed = true;
    }

    window.Hero = Hero;
} (window));
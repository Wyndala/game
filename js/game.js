if ('ontouchstart' in document.documentElement) {
    canvas.addEventListener('touchstart', function(e) {
        handleKeyDown();
    }, false);
} else {
    //document.onkeydown = handleKeyDown;
    document.onmousedown = handleKeyDown;

    document.addEvent('keydown', function(event) {
        switch(event.code) {
            case 37:
                hero.velocity.x = -10;
                if (hero.currentAnimation != 'runLeft') {
                    hero.playAnimation('runLeft');
                }
                break;
            case 39:
                hero.velocity.x = 10;
                if (hero.currentAnimation != 'runRight') {
                    hero.playAnimation('runRight');
                }
                break;
            case 38:
                hero.jump();
                break;
            case 40:
                hero.crouch();
                break;
        };
    });
    document.addEvent('keyup', function(event) {
        switch(event.code) {
            case 37:
                hero.velocity.x = 0;
                hero.playAnimation('standLeft');
                break;
            case 39:
                hero.velocity.x = 0;
                hero.playAnimation('standRight');
                break;
            case 40:
                hero.playAnimation(hero.oldAnimation);
                break;
        };
    });
}

var	stage,
    canvas,
    hero,
    start = {
        x: 0,
        y: 0
    }
    w = getWidth(),
    h = getHeight(),
    GRID_HORIZONTAL = 8,
    GRID_VERTICAL = 4,
    collects = 0,
    life = 5,
    alternate = 1,
    enemyCount = 10

function init() {
    window.collideables = [];
    window.collectables = [];
    canvas = document.createElement('canvas');
    canvas.width = getWidth();
    canvas.height = getHeight();
    document.body.appendChild(canvas);

    stage = new createjs.Stage(canvas);
    bg = new createjs.Bitmap('assets/bg.png');
    bg.y = 500;
    stage.addChild(bg);

    createjs.Sound.on('fileload', function(event) {
        if (event.id == 'theme') {
            //backgroundInstance = createjs.Sound.play('theme');
            //backgroundInstance.setVolume(0.1);
        }
    });
    registerSounds();
    onImageLoaded();


}

function registerSounds() {
    assetPath = "assets/snd/";
    createjs.Sound.registerSound(assetPath + "smw_jump.mp3|" + assetPath + "smw_jump.ogg", "jump");
    createjs.Sound.registerSound(assetPath + "smw_coin.mp3|" + assetPath + "smw_coin.ogg", "coin");
    createjs.Sound.registerSound(assetPath + "stomp.mp3", "stomp");
    createjs.Sound.registerSound(assetPath + "inactive.mp3", "inactive");
    createjs.Sound.registerSound(assetPath + "die.mp3", "die");
    createjs.Sound.registerSound(assetPath + "step-floor.mp3", "walk");
    createjs.Sound.registerSound(assetPath + "theme.mp3", "theme");

}

function onImageLoaded() {
    var w = getWidth();
    var h = getHeight();

    hero = new Hero();
    hero.x = start.x;
    hero.y = start.y;

    var jsonRequest = new Request.JSON({url: 'levels/level.json',
        onSuccess: function(responseJSON){
            loadLevel(responseJSON);
            stage.addChild(hero);
            hud = new Hud();

            hud.x = 0;
            hud.y = 0;
            hero.x = start.x;
            hero.y = start.y;
            stage.addChild(hud);
        },
        onError: function(erro) {
            console.log('error');
        },
        onFailure: function() {
            console.log('fail');
        }
    }).send();

    /*var l = 225;
    var atX=0;
    var atY = 300;
    //background = createBgGrid(GRID_HORIZONTAL,GRID_VERTICAL);
    //stage.addChild(background);
    addPlatform(atX,atY);
    for (var c = 1; c < l; c++ ) {
        // define a random x-koordinate relative to the last one
        atX = c * 405;
        // define a random y-koordinate relative to the last one
        atY = atY + Math.random() * 400 - 100;
        // add the platform
        addPlatform(atX,atY);
    }*/
    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener('tick', tick);


}

function loadLevel(json) {
    Object.each(json, function(item, index) {
        var addFunction = executeFunctionByName(item.name);
        addFunction(item.x, item.y);
    });
}

function executeFunctionByName(name) {
    switch (name) {
        case 'platform': return addPlatform;
        case 'coin': return addCoin;
        case 'box': return addBox;
        case 'start': return setStartPosition;
    }
}

function setStartPosition(x,y) {
    start.x = x;
    start.y = y - 80;
}

function addPlatform(x,y) {
    x = Math.round(x);
    y = Math.round(y);

    var platform = new createjs.Bitmap('assets/platform.png');
    platform.x = x;
    platform.y = y;
    platform.snapToPixel = true;

    stage.addChild(platform);
    window.collideables.push(platform);
    /*addCoin(x+75, y - 28);
    addCoin(x+150, y - 28);

    addBox(x+ 100, y - 100);

    addElevator(x + 300, y + 60);
    //if (enemyCount) {
        addEnemy(x+100,y - 30, platform);
        enemyCount--;
    //}*/

}

function addCoin(x,y) {
    x = Math.round(x);
    y = Math.round(y);

    var coin = new Collectable('assets/normalAppleSheet.png');
    coin.x = x;
    coin.y = y;
    coin.snapToPixel = true;

    stage.addChild(coin);
    window.collectables.push(coin);
}

function addEnemy(x,y, platform) {
    x = Math.round(x);
    y = Math.round(y);

    var test = new Enemy('assets/AndroidSprite.png', platform);
    test.x = x;
    test.y = y;
    test.snapToPixel = true;

    stage.addChild(test);
    window.collideables.push(test);
}

function addBox(x,y) {
    x = Math.round(x);
    y = Math.round(y);

    var box = new Interactor('assets/box_apple.png');
    box.x = x;
    box.y = y;
    box.snapToPixel = true;

    stage.addChild(box);
    window.collideables.push(box);
}

function addElevator(x,y) {
    x = Math.round(x);
    y = Math.round(y);
    alternate = -alternate;
    var elevator = new Elevator('assets/elevator.png', {maxY: y + 200, minY: y - 200}, alternate);
    elevator.x = x;
    elevator.y = y;
    elevator.snapToPixel = true;

    stage.addChild(elevator);
    window.collideables.push(elevator);
}

// move the hero down by 1px
// and update/render the stage
function tick() {
    if (!hero.killed) {
        if ( hero.x > getWidth()*.3 ) {
            stage.x = -hero.x + getWidth()*.3;
        }
        if ( hero.y > getHeight()*.4 ) {
            stage.y = -hero.y + getHeight()*.4;
        } else if ( hero.y < getHeight()*.3 ) {
            stage.y = -hero.y + getHeight()*.3;
        }
    }
    hud.x = -stage.x;
    hud.y = -stage.y;

    bg.x = -stage.x;
    //bg.y = -stage.y;

    //background.x = (stage.x * .45) % (w/GRID_HORIZONTAL); // horizontal
   // background.y = (stage.y * .45) % (h/GRID_VERTICAL);   // vertical
    hero.tick();
    stage.update();
}

function getWidth() {
    return window.getSize().x;
}

function getHeight() {
    return window.getSize().y;
}

// whenever a key is pressed then hero's
// position will set to y=0;
function handleKeyDown(e)
{
    hero.jump();
}

function reset() {
    hero.rotation = 0;
    hero.y = start.y;
    hero.killed = false;
    hero.x = start.x;
    stage.x = 0;
    hero.velocity.y = 12;
    hero.playAnimation('standRight');
}

document.addEvent('domready', function() {
    init();
});

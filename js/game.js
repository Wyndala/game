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
                if (!hero.killed) {
                    hero.velocity.x = -10;
                    if (hero.currentAnimation != 'runLeft') {
                        hero.playAnimation('runLeft');
                    }
                }
                break;
            case 39:
                if (!hero.killed) {
                    hero.velocity.x = 10;
                    if (hero.currentAnimation != 'runRight') {
                        hero.playAnimation('runRight');
                    }
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
    enemyCount = 10,
    stageObjectStack = []

function init() {
    window.collideables = [];
    window.collectables = [];
    canvas = document.createElement('canvas');
    canvas.width = getWidth();
    canvas.height = getHeight();
    document.body.appendChild(canvas);

    stage = new createjs.Stage(canvas);
    sky = new createjs.Bitmap('assets/layer_sky.png');
    sky.y = 0;

    stage.addChild(sky);

    clouds = new createjs.Bitmap('assets/layer_clouds.png');
    clouds.y = 0;
    stage.addChild(clouds);

    lessFarHouses = new createjs.Bitmap('assets/layer_less_far_houses.png');
    lessFarHouses.y = -150;
    stage.addChild(lessFarHouses);

    houses = new createjs.Bitmap('assets/layer_far_houses.png');
    houses.y = -150;
    stage.addChild(houses);

    nearHouses = new createjs.Bitmap('assets/layer_near_houses.png');
    nearHouses.y = -150;
    stage.addChild(nearHouses);



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
            hero.x = start.x;
            hero.y = start.y;

            createjs.Ticker.setFPS(30);
            createjs.Ticker.addEventListener('tick', tick);
            hud = new Hud();

            hud.x = 0;
            hud.y = 0;
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



}

function loadLevel(json) {
    Object.each(json, function(item, index) {
        if (item.linked > -1) {
            if (index < item.linked) {
                var linkedObject = json[item.linked];
                var preAddFunction = getFunctionByName(linkedObject.name);
                var addFunction = getFunctionByName(item.name);


                var stageObject = preAddFunction(linkedObject.x, linkedObject.y, linkedObject.options);

                stageObjectStack[index] = addFunction(item.x, item.y, stageObject);
            } else {

                var addFunction = getFunctionByName(item.name);

                var stageObject = stageObjectStack[item.linked];
                stageObjectStack[index] = addFunction(item.x, item.y, stageObject);
            }
        } else {
            var addFunction = getFunctionByName(item.name);
            stageObjectStack[index] = addFunction(item.x, item.y, item.options);
        }

    });
}

function getFunctionByName(name) {

    switch (name) {
        case 'platform': return addPlatform;
        case 'coin': return addCoin;
        case 'box': return addBox;
        case 'enemy': return addEnemy;
        case 'ground': return addGroundContainer;
        case 'platformContainer': return addPlatformContainer;
        case 'start': return setStartPosition;
        case 'elevator': return addElevator;
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

    return platform;

    /*addCoin(x+75, y - 28);
    addCoin(x+150, y - 28);

    addBox(x+ 100, y - 100);

    addElevator(x + 300, y + 60);
    //if (enemyCount) {
        addEnemy(x+100,y - 30, platform);
        enemyCount--;
    //}*/

}

function addGroundContainer(x, y, options) {
    x = Math.round(x);
    y = Math.round(y);

    var groundContainer = new GroundContainer(options);
    groundContainer.x = x;
    groundContainer.y = y;
    groundContainer.snapToPixel = true;

    stage.addChild(groundContainer);
    window.collideables.push(groundContainer);
    groundContainer.on('completeLoading', function() {
        this.cache(0,0,this.options.width, this.options.height);
    })

    return groundContainer;
}

function addPlatformContainer(x, y, options) {
    x = Math.round(x);
    y = Math.round(y);

    var platformContainer = new PlatformContainer(options);
    platformContainer.x = x;
    platformContainer.y = y;
    platformContainer.snapToPixel = true;

    stage.addChild(platformContainer);
    window.collideables.push(platformContainer);
    platformContainer.on('completeLoading', function() {
        this.cache(0,0,this.options.width, this.options.height);
    })

    return platformContainer;
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

    return coin;
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

    return test;
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

    return box;
}

function addElevator(x,y, options) {
    x = Math.round(x);
    y = Math.round(y);
    var elevator = new Elevator('assets/elevatorSprite.png', {maxY: options.maxY, minY: options.minY});
    elevator.x = x;
    elevator.y = y;
    elevator.snapToPixel = true;

    stage.addChild(elevator);
    window.collideables.push(elevator);

    return elevator;
}

// move the hero down by 1px
// and update/render the stage
function tick() {
    if (!hero.killed) {
        if ( hero.x > getWidth()*.5 ) {
            stage.x = -hero.x + getWidth()*.5;
        }

        if ( hero.y +stage.y > getHeight() * .4  && stage.y > getHeight()-getVisibleHeight()) {
            stage.y = Math.round(Number(-hero.y + getHeight()*.4).limit(getHeight()-getVisibleHeight(), (-hero.y + getHeight()*.4)));
        } else if ( hero.y +stage.y <= getHeight() * .4) {
            stage.y = -hero.y + getHeight()*.4;
        }
    }
    hud.x = -stage.x;
    hud.y = -stage.y;

    sky.x = -stage.x;
    sky.y = -stage.y;

    houses.x = -stage.x * 0.7;
    houses.y = -stage.y * 0.7;

    lessFarHouses.x = -stage.x * 0.85;
    lessFarHouses.y = -stage.y * 0.85;

    clouds.x = -stage.x * 0.9;
    clouds.y = -stage.y * 0.9;

    nearHouses.x = -stage.x * 0.4;
    nearHouses.y = -stage.y * 0.5 - 150;

    hero.tick();
    stage.update();
}

function getWidth() {
    return window.getSize().x;
}

function getHeight() {
    return window.getSize().y;
}

function getVisibleHeight() {
    return 900;
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

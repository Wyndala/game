var	stage,
    canvas,
    hero,
    w = getWidth(),
    h = getHeight(),
    actElement = null,
    elementIterator = 0,
    gridModulo = 10,
    grid = null,
    editorJSON = {

    },
    markerShape = null,
    lastElementTime = 0

function init() {
    canvas = document.createElement('canvas');
    canvas.width = getWidth();
    canvas.height = getHeight();
    document.body.appendChild(canvas);
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(10);
    stage.on('stagemousemove', function(event) {
        if (actElement) {
            actElement.alpha = 0.8;
            var correctedX = event.stageX - stage.x;
            var correctedY = event.stageY - stage.y;

            actElement.x = correctedX - (correctedX % gridModulo);
            actElement.y = correctedY - (correctedY % gridModulo);
        } else {
            if (event.rawX < 40) {
                moveStage({x: 10, y: 0});
            } else if (event.rawX > window.getSize().x - 40) {
                moveStage({x: -10, y: 0});
            }

            if (event.rawY < 40) {
                moveStage({x: 0, y: 10});
            } else if (event.rawY > window.getSize().y - 40) {
                moveStage({x: 0, y: -10});
            }
        }
    });
    /*
    stage.on('click', function(event) {
        if(!event.target.name) {
            resetContext();
        }
    });*/

    stage.on('stagemouseup', function(event) {
        if (actElement) {
            lastElementTime = event.timeStamp;
            addElement();
        }

        if (!markerShape) {
            resetContext();
        }
    });

    //bg = new createjs.Bitmap('assets/bg_editor.png');
    //stage.addChild(bg);
    var gridCount = getWidth() / 10;
    grid = createBgGrid(gridCount, gridCount);
    stage.addChild(grid);

    createjs.Ticker.setFPS(5);
    createjs.Ticker.addEventListener('tick', tick);
}

function addPlatform(x,y) {
    x = Math.round(x);
    y = Math.round(y);

    var platform = new createjs.Bitmap('assets/platform.png');
    platform.x = x;
    platform.y = y;
    platform.snapToPixel = true;
    platform.name = 'platform';

    stage.addChild(platform);
    if (actElement != null) {
        stage.removeChild(actElement);
    }
    actElement = platform;
}

function addCoin(x,y) {
    x = Math.round(x);
    y = Math.round(y);

    var coin = new Collectable('assets/normalAppleSheet.png');
    coin.x = x;
    coin.y = y;
    coin.snapToPixel = true;
    coin.name = 'coin';

    stage.addChild(coin);
    if (actElement != null) {
        stage.removeChild(actElement);
    }
    actElement = coin;
}

function addEnemy(x,y, platform) {
    x = Math.round(x);
    y = Math.round(y);

    var enemy = new Enemy('assets/turtleSprite.png', platform);
    enemy.removeAllEventListeners();
    enemy.x = x;
    enemy.y = y;
    enemy.snapToPixel = true;

    stage.addChild(enemy);

    if (actElement != null) {
        stage.removeChild(actElement);
    }
    actElement = enemy;
}

function addBox(x,y) {
    x = Math.round(x);
    y = Math.round(y);

    var box = new Interactor('assets/box.png');
    box.x = x;
    box.y = y;
    box.snapToPixel = true;
    box.name = 'box';

    stage.addChild(box);
    if (actElement != null) {
        stage.removeChild(actElement);
    }
    actElement = box;
}

function addStart(x,y) {
    x = Math.round(x);
    y = Math.round(y);

    var mario = new createjs.Bitmap('assets/mario.png');
    mario.x = x;
    mario.y = y;
    mario.snapToPixel = true;
    mario.name = 'start';

    stage.addChild(mario);
    if (actElement != null) {
        stage.removeChild(actElement);
    }
    actElement = mario;
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
}

function tick() {
   stage.update();
}

function getWidth() {
    return window.getSize().x;
}

function getHeight() {
    return window.getSize().y;
}

function addElement() {
    actElement.alpha = 1;
    if (typeof actElement.JSONid == 'undefined') {
        editorJSON[elementIterator] = {

        }
        editorJSON[elementIterator]['name'] = actElement.name;
        editorJSON[elementIterator]['x'] = actElement.x;
        editorJSON[elementIterator]['y'] = actElement.y;
        actElement.JSONid = elementIterator;
        addElementEvents(actElement);
        actElement = null;
        elementIterator++;
    } else {
        editorJSON[actElement.JSONid]['x'] = actElement.x;
        editorJSON[actElement.JSONid]['y'] = actElement.y;
        addElementEvents(actElement);
        actElement = null;
    }


}

function addElementEvents(element) {
    element.on('click', function(event) {
        if (event.timeStamp - 1000 > lastElementTime) {
            var x = event.rawX - (event.rawX % gridModulo) + gridModulo;
            var y = event.rawY - (event.rawY % gridModulo) + gridModulo;

            $('context').setStyles({'left': x, 'top': y });
            $('delete').removeEvents();
            $('delete').addEvent('click', function() {
                removeElement(element);
                resetContext();
            });

            $('edit').removeEvents();
            $('edit').addEvent('click', function() {
                actElement = element;
                actElement.removeAllEventListeners();
            });
        }

    });

    element.on('mouseover', function(event) {
        var bounds = this.getBounds();
        markerShape = new createjs.Shape();
        markerShape.graphics.beginStroke("#ff0000").drawRect(this.x, this.y, bounds.width, bounds.height);
        stage.addChild(markerShape);
    });

    element.on('mouseout', function(event) {
        if (markerShape) {
            stage.removeChild(markerShape);
            markerShape = null;
        }

    });
}

function resetContext() {
    if ($('context').getStyle('left').toInt() > 0) {
        $('context').setStyles({'left': -500 });
    }

}

function removeElement(element) {
    stage.removeChild(element);
    elementIterator--;
    delete editorJSON[element.JSONid];
    editorJSON = correctObjectKeys(editorJSON);
}

function correctObjectKeys(editorJSON) {
    var values = Object.values(editorJSON);
    var newObject = {};
    values.each(function(item, index) {
        newObject[index] = item;
    });
    return newObject;
}

function createBgGrid(numX, numY) {
    var grid = new createjs.Container();
    grid.snapToPixel = true;
    // calculating the distance between
    // the grid-lines
    var gw = gridModulo;
    var gh = gridModulo;
    // drawing the vertical line
    var verticalLine = new createjs.Graphics();
    verticalLine.beginFill(createjs.Graphics.getRGB(0, 0, 0));
    verticalLine.drawRect(0,0,gw * 0.02,gh*(numY+2));
    var vs;
    // placing the vertical lines:
    // we're placing 1 more than requested
    // to have seamless scrolling later
    for ( var c = -1; c < numX+1; c++) {
        vs = new createjs.Shape(verticalLine);
        vs.snapToPixel = true;
        vs.x = c * gw;
        vs.y = -gh;
        grid.addChild(vs);
    }
    // drawing a horizontal line
    var horizontalLine = new createjs.Graphics();
    horizontalLine.beginFill(createjs.Graphics.getRGB(0, 0, 0));
    horizontalLine.drawRect(0,0,gw*(numX+1),gh * 0.02);
    var hs;
    // placing the horizontal lines:
    // we're placing 1 more than requested
    // to have seamless scrolling later
    for ( c = -1; c < numY+1; c++ ) {
        hs = new createjs.Shape(horizontalLine);
        hs.snapToPixel = true;
        hs.x = 0;
        hs.y = c * gh;
        grid.addChild(hs);
    }

    // return the grid-object
    return grid;
}

function saveJSON() {
    var saveJSON = new Element('textarea', {'class': 'save' ,rows: 100, cols: 100, text: JSON.encode(editorJSON)});
    saveJSON.inject($$('body')[0], 'top');
}

function undo() {
    if (elementIterator > 0) {
        if (markerShape) {
            stage.removeChild(markerShape);
        }

        stage.removeChildAt(elementIterator);
        elementIterator--;
        delete editorJSON[elementIterator];
    }
}

document.addEvent('keydown', function(event) {
    switch(event.code) {
        // Plattform
        case 80:
            addPlatform(0,0);
            break;
        case 67:
            addCoin(0,0);
            break;
        case 66:
            addBox(0,0);
            break;
        case 69:
            addEnemy(0,0);
            break;
        case 77:
            addStart(0,0);
            break;
        case 83:
            saveJSON();
            break;
        case 37:
            moveStage({x: 20, y: 0});
            break;
        case 39:
            moveStage({x: -20, y: 0});
            break;
        case 96:
            moveStage({x: -stage.x, y: -stage.y});
            break;
    };
});

/**
 * moves stage by value object
 * @param value {x: xx, y: xx}
 */
function moveStage(value) {
    stage.x += value.x;
    stage.y += value.y;

    grid.x = -stage.x;
    grid.y = -stage.y;
}

var myKeyboardEvents = new Keyboard({
    defaultEventType: 'keyup',
    events: {
        'ctrl+z': function() {
            undo();
        }
    },
    active: true
});

document.addEvent('domready', function() {
    init();
});
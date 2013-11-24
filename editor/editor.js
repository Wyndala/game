var	stage,
    canvas,
    hero,
    w = getWidth(),
    h = getHeight(),
    actElement = null,
    markedElement = null,
    elementIterator = 0,
    gridModulo = 5,
    grid = null,
    editorJSON = {

    },
    markerShape = null,
    lastElementTime = 0,
    toolBox = null,
    tileStart = null,
    highlightShape = new createjs.Shape(),
    elementName = '',
    mouse = null;

function init() {
    toolBox = new Window($$('.window')[0], {'handle': $$('.window .title')[0]});
    mouse = new Mouse();

    toolBox.addEvent('clicked', function(obj) {
        executeFunctionByName(obj.get('id'))();
    });

    canvas = document.createElement('canvas');
    canvas.width = getWidth();
    canvas.height = getHeight();
    document.body.appendChild(canvas);
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(10);
    mouse.addEventByMode(stage, 'normal', 'stagemousemove', function(event) {
        if (actElement) {
            actElement.alpha = 0.8;
            var eventCoordinates = getCorrectedEventCoordinates(event);

            actElement.x = eventCoordinates.x - (eventCoordinates.x % gridModulo);
            actElement.y = eventCoordinates.y - (eventCoordinates.y % gridModulo);
        } else {

        }
    });

    mouse.addEventByMode(stage, 'tile', 'stagemousemove', function(event) {
        var eventCoordinates = getCorrectedEventCoordinates(event);
        var x = eventCoordinates.x;
        var y = eventCoordinates.y;
        if (tileStart) {
            stage.removeChild(markerShape);
            markerShape = new createjs.Shape();
            markerShape.graphics.beginStroke("#00f600").drawRect(tileStart.x, tileStart.y, x - tileStart.x, y - tileStart.y);
            stage.addChild(markerShape);
        } else {
            stage.removeChild(highlightShape);
            highlightShape = new createjs.Shape();
            highlightShape.graphics.beginFill("#00f600").drawRect(x, y, gridModulo, gridModulo);
            stage.addChild(highlightShape);
        }
    });

    mouse.addEventByMode(stage, 'elevator', 'stagemousemove', function(event) {
        var eventCoordinates = getCorrectedEventCoordinates(event);
        var x = eventCoordinates.x;
        var y = eventCoordinates.y;
        if (tileStart) {
            stage.removeChild(markerShape);
            markerShape = new createjs.Shape();
            markerShape.graphics.beginStroke("#00f600").drawRect(tileStart.x, tileStart.y, x - tileStart.x, y - tileStart.y);
            stage.addChild(markerShape);
        } else {
            stage.removeChild(highlightShape);
            highlightShape = new createjs.Shape();
            highlightShape.graphics.beginFill("#00f600").drawRect(x, y, gridModulo, gridModulo);
            stage.addChild(highlightShape);
        }
    });

    $('menu_new').addEvent('click', function(event) {
        new MooDialog.Prompt('Level-Name: ', function(ret){
            console.log(ret);
        });
        /*elementIterator = 0;
        editorJSON = {

        };
        stage.removeAllChildren();
        var gridCount = getWidth() / 10;
        grid = createBgGrid(gridCount, gridCount);
        stage.addChild(grid);*/
    });

    $('menu_save').addEvent('click', function(event) {
        save(this);
    });

    $('menu_load').addEvent('click', function(event) {
        event.stop();
        performClick($('load'));
    });

    $('load').addEvent('change', function(evt) {
            var files = evt.target.files; // FileList object

            for (var i = 0, f; f = files[i]; i++) {
                var reader = new FileReader();

                reader.onload = (function(file) {
                    return function(e) {
                        var jsonContent = JSON.decode(e.target.result);
                        loadLevel(jsonContent);
                    };
                })(f);

                reader.readAsBinaryString(f);
            }

    });

    $('menu_elements').addEvent('click', function(event) {
        event.stop();
        $('elements').toggleClass('active');
        $('menu_elements').getElement('.window-icon').toggleClass('active');
    });
    mouse.addEventByMode(stage, 'normal', 'stagemouseup', function(event) {
        if (actElement) {
            lastElementTime = event.timeStamp;
            addElement();
        }

        if (!markerShape) {
            resetContext();
        }
    });

    mouse.addEventByMode(stage, 'link', 'stagemouseup', function(event) {
        if (!markerShape) {
            mouse.setMouseMode('normal');
        }
    });

    mouse.addEventByMode(stage, 'tile', 'stagemouseup', function(event) {
        var eventCoordinates = getCorrectedEventCoordinates(event);
        var x = eventCoordinates.x;
        var y = eventCoordinates.y;
        if (tileStart) {
            var options = {
                width: (x - tileStart.x),
                height: (y - tileStart.y),
                style: 'fullRect'
            }
            var tileAddFunction = executeFunctionByName(elementName, 1);
            tileAddFunction(tileStart.x, tileStart.y, options);
            var tempIterator = elementIterator;
            addElement();
            editorJSON[tempIterator].options = options;
            mouse.setMouseMode('normal');
            tileStart = null;
            stage.removeChild(markerShape);
            stage.removeChild(highlightShape);
            markerShape = null;
        } else {
            tileStart = {
                x: x,
                y: y
            }
        }
    });

    mouse.addEventByMode(stage, 'elevator', 'stagemouseup', function(event) {
        var eventCoordinates = getCorrectedEventCoordinates(event);
        var x = eventCoordinates.x;
        var y = eventCoordinates.y;
        if (tileStart) {
            var options = {
                minY: tileStart.y,
                maxY: y
            }

            addElevator(tileStart.x, tileStart.y, options);
            var tempIterator = elementIterator;
            addElement();
            editorJSON[tempIterator].options = options;
            mouse.setMouseMode('normal');
            tileStart = null;
            stage.removeChild(markerShape);
            stage.removeChild(highlightShape);
            markerShape = null;
        } else {
            tileStart = {
                x: x,
                y: y
            }
        }
    });

    //bg = new createjs.Bitmap('assets/bg_editor.png');
    //stage.addChild(bg);
    var gridCount = getWidth() / gridModulo;
    grid = createBgGrid(gridCount, gridCount);
    stage.addChild(grid);

    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener('tick', tick);
}

function loadLevel(json) {
    Object.each(json, function(item, index) {
        var addFunction = executeFunctionByName(item.name, 1);
        addFunction(item.x, item.y, item.options);
        if (actElement) {
            var tempIterator = elementIterator;
            addElement();
            if (item.options) {
                editorJSON[tempIterator].options = item.options;
            }
            if (item.linked > -1) {
                editorJSON[tempIterator].linked = item.linked;
            }
        }
    });
}

function save(thisContext) {
    var data = editorJSON;
    var json = JSON.stringify(data);
    var blob = new Blob([json], {type: "application/json"});
    var url  = URL.createObjectURL(blob);
    thisContext.download    = "level.json";
    thisContext.set('href',url);
}

function executeFunctionByName(name, loading) {
    switch (name) {
        case 'platform': return addPlatform;
        case 'coin': return addCoin;
        case 'box': return addBox;
        case 'start': return addStart;
        case 'enemy': return addEnemy;
        case 'ground': {
            if (loading) {
                return addGroundContainer;
            }
            elementName = 'ground';
            return initTilePlacement;
        }
        case 'elevator': {
            if (loading) {
                return addElevator;
            }

            return initElevatorPlacement;
        }
        case 'platformContainer': {
            if (loading) {
                return addPlatformContainer;
            }
            elementName = 'platformContainer';
            return initTilePlacement;
        }
    }
}

function initTilePlacement(x,y) {
    mouse.setMouseMode('tile');
}

function initElevatorPlacement(x,y) {
    mouse.setMouseMode('elevator');
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

function addGroundContainer(x, y, options) {
    x = Math.round(x);
    y = Math.round(y);

    var groundContainer = new GroundContainer(options);
    groundContainer.x = x;
    groundContainer.y = y;
    groundContainer.snapToPixel = true;

    stage.addChild(groundContainer);

    if (actElement != null) {
        stage.removeChild(actElement);
    }

    actElement = groundContainer;
}

function addPlatformContainer(x, y, options) {
    x = Math.round(x);
    y = Math.round(y);

    var platformContainer = new PlatformContainer(options);
    platformContainer.x = x;
    platformContainer.y = y;
    platformContainer.snapToPixel = true;

    stage.addChild(platformContainer);

    if (actElement != null) {
        stage.removeChild(actElement);
    }

    actElement = platformContainer;
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

    var enemy = new Enemy('assets/AndroidSprite.png', platform);
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

function addElevator(x,y, options) {
    x = Math.round(x);
    y = Math.round(y);
    var elevator = new Elevator('assets/elevatorSprite.png', {maxY: options.maxY, minY: options.minY});
    elevator.x = x;
    elevator.y = y;
    elevator.snapToPixel = true;
    elevator.name = 'elevator';

    stage.addChild(elevator);
    if (actElement != null) {
        stage.removeChild(actElement);
    }
    actElement = elevator;
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
    mouse.addEventByMode(element, 'normal', 'click', function(event) {
        if (event.timeStamp - 1000 > lastElementTime) {
            var x = event.rawX - (event.rawX % gridModulo) + gridModulo;
            var y = event.rawY - (event.rawY % gridModulo) + gridModulo;

            $('context').setStyles({'left': x, 'top': y });
            $('delete').removeEvents();
            $('delete').addEvent('click', function() {
                removeElement(element);
                resetContext();
            });

            $('link').removeEvents();
            $('link').addEvent('click', function() {
                markedElement = element;
                mouse.setMouseMode('link');
            });

            $('edit').removeEvents();
            $('edit').addEvent('click', function() {
                actElement = element;
                actElement.removeAllEventListeners();
            });

            $('forground').removeEvents();
            $('forground').addEvent('click', function() {
                var newJsonId = stage.children[stage.children.length - 1].JSONid;
                var oldJsonId = element.JSONid;

                element.JSONid = newJsonId;
                stage.children[stage.children.length - 1].JSONid = oldJsonId;

                var newJsonObject = editorJSON[newJsonId];
                var oldJsonObject = editorJSON[oldJsonId];

                editorJSON[newJsonId] = oldJsonObject;
                editorJSON[oldJsonId] = newJsonObject;

                stage.swapChildren(element, stage.children[stage.children.length - 1]);
            });
        }
    });

    mouse.addEventByMode(element, 'link', 'click', function(event) {
        if (event.timeStamp - 1000 > lastElementTime) {
            editorJSON[markedElement.JSONid].linked = element.JSONid;
            markedElement = null;
            mouse.setMouseMode('normal');
        }
    });

    mouse.addEventByMode(element, 'normal', 'mouseover', function(event) {
        var bounds = element.getBounds();
        markerShape = new createjs.Shape();
        markerShape.graphics.beginStroke("#ff0000").drawRect(element.x, element.y, bounds.width, bounds.height);
        stage.addChild(markerShape);
    });

    mouse.addEventByMode(element, 'normal', 'mouseout', function(event) {
        if (markerShape) {
            stage.removeChild(markerShape);
            markerShape = null;
        }
    });

    mouse.addEventByMode(element, 'link', 'mouseover', function(event) {
        var bounds = element.getBounds();
        markerShape = new createjs.Shape();
        markerShape.graphics.beginStroke("#123456").drawRect(element.x, element.y, bounds.width, bounds.height);
        stage.addChild(markerShape);
    });

    mouse.addEventByMode(element, 'link', 'mouseout', function(event) {
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
    correctJsonIds(element.JSONid);

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

function correctJsonIds(deletedId) {
    var reachedDeletedId = false;
    stage.children.each(function(item, index) {
        if (reachedDeletedId) {
            item.JSONid = item.JSONid - 1;
        }

        if (item.JSONid == deletedId) {
            reachedDeletedId = true;
        }
    });
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
    verticalLine.drawRect(0,0,gw * 0.03,gh*(numY+2));
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
    horizontalLine.drawRect(0,0,gw*(numX+1),gh * 0.03);
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

function getCorrectedEventCoordinates(event) {
    var correctedX = event.stageX - stage.x;
    var correctedY = event.stageY - stage.y;
    return {x: correctedX - (correctedX % gridModulo), y: correctedY - (correctedY % gridModulo)};
}

document.addEvent('keydown', function(event) {
    switch(event.code) {
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
        },
        'ctrl+s': function(event) {

        }
    },
    active: true
});

document.addEvent('domready', function() {
    init();
});

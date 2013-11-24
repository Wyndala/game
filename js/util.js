/*
 * Calculated the boundaries of an object.
 *
 * @method getBounds
 * @param {DisplayObject} the object to calculate the bounds from
 * @return {Rectangle} The rectangle describing the bounds of the object
 */
function getBounds(obj) {
    var bounds={x:Infinity,y:Infinity,width:0,height:0};
    if (obj && obj.getBounds()) {
        bounds = obj.getBounds();
        bounds.height--;
        bounds.x = obj.x;
        bounds.y = obj.y;

    }

    return bounds;
}

function calculateIntersection(rect1, rect2, x, y) {
    // prevent x|y from being null||undefined
    x = x || 0; y = y || 0;

    // first we have to calculate the
    // center of each rectangle and half of
    // width and height
    var dx, dy, r1={}, r2={};
    r1.cx = rect1.x+x+(r1.hw = (rect1.width /2));
    r1.cy = rect1.y+y+(r1.hh = (rect1.height/2));
    r2.cx = rect2.x + (r2.hw = (rect2.width /2));
    r2.cy = rect2.y + (r2.hh = (rect2.height/2));

    dx = Math.abs(r1.cx-r2.cx) - (r1.hw + r2.hw);
    dy = Math.abs(r1.cy-r2.cy) - (r1.hh + r2.hh);

    if (dx < 0 && dy < 0) {
        return {width:-dx,height:-dy, x: x, y: y};
    } else {
        return null;
    }
}

function calculateCollision(obj, direction, collideables, moveBy)
{
    moveBy = moveBy || {x:0,y:0};
    if ( direction != 'x' && direction != 'y' ) {
        direction = 'x';
    }
    var measure = direction == 'x' ? 'width' : 'height',
        oppositeDirection = direction == 'x' ? 'y' : 'x',
        oppositeMeasure = direction == 'x' ? 'height' : 'width',

        bounds = getBounds(obj),
        cbounds,
        collision = null,
        cc = 0;

    // for each collideable object we will calculate the
    // bounding-rectangle and then check for an intersection
    // of the hero's future position's bounding-rectangle
    while ( !collision && cc < collideables.length && !obj.killed) {
        cbounds = getBounds(collideables[cc]);
        if ( collideables[cc].isVisible ) {
            collision = calculateIntersection(bounds, cbounds, moveBy.x, moveBy.y);
        }
        if (obj.name == "Hero") {
            if (collision && collideables[cc].name=="Interactor") {
                if ( collision.y < 0 && collideables[cc].currentAnimation != 'inactive') {
                    collideables[cc].activate();
                } else if (collision.y < 0 && collideables[cc].currentAnimation == 'inactive') {
                    var instance = createjs.Sound.play('inactive');
                    instance.setVolume(0.1);
                }
            }

            if (collision && collideables[cc].name=="elevator") {
                if ( collision.y > 0) {
                    hero.onElevator = true;
                } else {
                    collision = null;
                }
            } else if (collision) {
                hero.onElevator = false;
            }

            if (collision && collideables[cc].name=="enemy") {
                if (collision) {
                   // console.log(collision);
                }

                if ( collision.y > 0) {
                    collideables[cc].kill();
                    collision = null;
                    hero.velocity.y = -10;
                } else if (collision.height > 20 && !collideables[cc].killed) {
                    hero.kill();

                } else {
                    collision = null;
                }
            }
        } else if (obj.name == "enemy") {

            if (collision && collideables[cc].name=="enemy") {
                collision = null;
            }
        }


        if ( !collision && collideables[cc].isVisible) {
            // if there was NO collision detected, but somehow
            // the hero got onto the "other side" of an object (high velocity e.g.),
            // then we will detect this here, and adjust the velocity according to
            // it to prevent the Hero from "ghosting" through objects
            // try messing with the 'this.velocity = {x:0,y:125};'
            // -> it should still collide even with very high values
            var wentThroughForwards  = ( bounds[direction] < cbounds[direction] && bounds[direction] + moveBy[direction] > cbounds[direction] ),
                wentThroughBackwards = ( bounds[direction] > cbounds[direction] && bounds[direction] + moveBy[direction] < cbounds[direction] ),
                withinOppositeBounds = !(bounds[oppositeDirection]+bounds[oppositeMeasure] < cbounds[oppositeDirection])
                    && !(bounds[oppositeDirection] > cbounds[oppositeDirection]+cbounds[oppositeMeasure]);

            if ( (wentThroughForwards || wentThroughBackwards) && withinOppositeBounds && collideables[cc].name != 'Enemy') {
                moveBy[direction] = cbounds[direction] - bounds[direction];
            } else {
                cc++;
            }
        }
    }

    if ( collision ) {
        var sign = Math.abs(moveBy[direction]) / moveBy[direction];
        moveBy[direction] -= collision[measure] * sign;
        if (isNaN(moveBy[direction])) {
            moveBy[direction] = 0;
        }

    }

    return collision;
}

function calculateCollisionWithCollectables(obj, collectables, moveBy)
{
    moveBy = moveBy || {x:0,y:0};

    var bounds = getBounds(obj),
        cbounds,
        collision = null,
        cc = 0,
        collect = [];

    // for each collideable object we will calculate the
    // bounding-rectangle and then check for an intersection
    // of the hero's future position's bounding-rectangle
    while ( !collision && cc < collectables.length ) {
        cbounds = getBounds(collectables[cc]);
        if (typeof collectables[cc] != 'undefined') {
            if ( collectables[cc].isVisible ) {
                collision = calculateIntersection(bounds, cbounds, moveBy.x, moveBy.y);
                if (collision) {
                    collect.push(cc);
                }
            }
        }
        cc++;
    }

    return collect;
}



function getCollideables() {
    return window.collideables;
}

function getCollectables() {
    return window.collectables;
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

function performClick(node) {
    var evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, false);
    node.dispatchEvent(evt);
}
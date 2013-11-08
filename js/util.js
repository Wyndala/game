/*
 * Calculated the boundaries of an object.
 *
 * @method getBounds
 * @param {DisplayObject} the object to calculate the bounds from
 * @return {Rectangle} The rectangle describing the bounds of the object
 */
function getBounds(obj) {
    var bounds={x:Infinity,y:Infinity,width:0,height:0};
    if ( obj instanceof createjs.Container ) {
        var children = obj.children, l=children.length, cbounds, c;
        for ( c = 0; c < l; c++ ) {
            cbounds = getBounds(children[c]);
            if ( cbounds.x < bounds.x ) bounds.x = cbounds.x;
            if ( cbounds.y < bounds.y ) bounds.y = cbounds.y;
            if ( cbounds.width >bounds.width ) bounds.width = cbounds.width;
            if ( cbounds.height > bounds.height ) bounds.height = cbounds.height;
        }
    } else {
        var gp,gp2,gp3,gp4,imgr;
        if ( obj instanceof createjs.Bitmap ) {
            imgr = obj.image;
        } else if ( obj instanceof createjs.Sprite ) {
            if ( obj.spriteSheet._frames && obj.spriteSheet._frames[obj.currentFrame] && obj.spriteSheet._frames[obj.currentFrame].image )
                imgr = obj.spriteSheet.getFrame(obj.currentFrame).rect;
            else
                return bounds;
        } else {
            return bounds;
        }

        gp = obj.localToGlobal(0,0);
        gp2 = obj.localToGlobal(imgr.width,imgr.height);
        gp3 = obj.localToGlobal(imgr.width,0);
        gp4 = obj.localToGlobal(0,imgr.height);

        bounds.x = Math.min(Math.min(Math.min(gp.x,gp2.x),gp3.x),gp4.x);
        bounds.y = Math.min(Math.min(Math.min(gp.y,gp2.y),gp3.y),gp4.y);
        bounds.width = Math.max(Math.max(Math.max(gp.x,gp2.x),gp3.x),gp4.x) - bounds.x;
        bounds.height = Math.max(Math.max(Math.max(gp.y,gp2.y),gp3.y),gp4.y) - bounds.y;
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
                    console.log('test');
                    var instance = createjs.Sound.play('inactive');
                    instance.setVolume(0.1);
                }
            }

            if (collision && collideables[cc].name=="Elevator") {
                if ( collision.y > 0) {
                    hero.onElevator = true;
                } else {
                    collision = null;
                }
            } else if (collision) {
                hero.onElevator = false;
            }

            if (collision && collideables[cc].name=="Enemy") {
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
        } else if (obj.name == "Enemy") {

            if (collision && collideables[cc].name=="Enemy") {
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
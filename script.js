const FPS = 30; //frames per second
const friction = 0.7; //friction coefficient of space (0 = no friction 1= high friction)
const laserMax = 10; //maximum number of lasers on screen at once
const laserSpeed = 500; // speed of lasers in pixels per second
const roidNum = 3; //starting number of asteroids
const roidJag = 0.4; //jaggedness of the asteroids (0 = none 1= alot)
const roidSize = 100; //starting size of asteroids in pixels
const roidSpeed = 50; //max starting speed of asteroids in pixels per second
const roidVert = 10 //average humber of vertices on each asteroid
const shipSize= 30; //ship height in pixels
const turnSpeed = 360; //turn speed in degrees per second
const shipThrust = 5; //acceleration of the ship in pixels per second per second
const showBounding = false; //show or hide collision bounding 
const shipExplodeDur = 0.3; //durration of ships explosion
const shipInvDur = 3; //duration of the ships invisibility in seconds
const shipBlinkDur = 0.1; //duration of the ships blink during invisibility in seconds
const laserDist = 0.6; //max distance laser can travel as fraction of screen width
const laserExplodeDur = 0.1; //duration of the lasers explosion in seconds
const textFadeTime = 2.5; //text fade time in seconds
const textSize = 60; //text font height in pixels
const gameLives= 3; //starting number of lives


/** @type {HTMLCanvasElement} */
var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

//set up the game parameters
var level, lives, roids, ship, text, textAlpha;
newGame();

// set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// set up the game loop
setInterval(update, 1000 / FPS);

function createAsteroidBelt() {
    roids = [];
    for (var i = 0; i < roidNum + level; i++ ) {
        do {
        x = Math.floor(Math.random() * canv.width);
        y = Math.floor(Math.random() * canv.height);
        } 
        while (distBetweenPoints(ship.x, ship.y, x, y) < roidSize * 2 + ship.r);
        roids.push(newAsteroid(x, y, Math.ceil(roidSize / 2)));
    }
}

function destroyAsteroid(index) {
    var x = roids[index].x;
    var y = roids[index].y;
    var r = roids[index].r;

    //split the asteroid in two
    if (r == Math.ceil(roidSize / 2)) {
        roids.push(newAsteroid(x, y, Math.ceil(roidSize / 4)));
        roids.push(newAsteroid(x, y, Math.ceil(roidSize / 4)));
    }
    else if (r == Math.ceil(roidSize /4)) {
        roids.push(newAsteroid(x, y, Math.ceil(roidSize / 8)));
        roids.push(newAsteroid(x, y, Math.ceil(roidSize / 8)));
    }

    //destory the asteroid
    roids.splice(index, 1);

    //new level when asteroids destroyed
    if (roids.length == 0) {
        level++;
        newLevel();
    }
}

function explodeShip() {
    ship.explodeTime = Math.ceil(shipExplodeDur * FPS);

}

function gameOver() {
    ship.dead = true;
    text = "You Suck";
    textAlpha = 1.0;
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawShip(x, y, a, color = "white") {
    ctx.strokeStyle = color;
      ctx.lineWidth = shipSize/20;
      ctx.beginPath();
   
      //   nose of the ship
      ctx.moveTo(
        x + 4/3 * ship.r * Math.cos(a),
        y - 4/3 * ship.r * Math.sin(a)
      );
    //   rear left of ship
      ctx.lineTo(
        x - ship.r * (2/3 * Math.cos(a) + Math.sin(a)),
        y + ship.r * (2/3 * Math.sin(a) - Math.cos(a))
      );
    //   rear right of ship
      ctx.lineTo(
        x - ship.r * (2/3 * Math.cos(a) - Math.sin(a)),
        y + ship.r * (2/3 * Math.sin(a) + Math.cos(a))
      );
    //   closePath completes the triangle making up the ship
      ctx.closePath();
      ctx.stroke();
}

function keyDown( /** @type {KeyboardEvent} */ ev) {
    
    if (ship.dead) {
        return;
    }
    
    switch(ev.keyCode) {
        case 32: //space bar (allow shooting again)
        ship.canShoot = true;
            shootLaser();
            break;
        case 37: //left arrow (rotate ship left)
            ship.rot = turnSpeed / 180 * Math.PI / FPS;
            break;
        case 38: // up arrow (thrust the ship forward)
            ship.thrusting = true;
            break;
        case 39: //right arrow (rotate ship right)
            ship.rot = -turnSpeed / 180 * Math.PI / FPS;
            break;
    }
};

function keyUp( /** @type {KeyboardEvent} */ ev) {
    
    if (ship.dead) {
        return;
    }
    
    switch(ev.keyCode) {
        case 37: //left arrow (stop rotating ship left)
            ship.rot = 0;
            break;
        case 38: // up arrow (stop the thrust of the ship forward)
            ship.thrusting = false;
            break;
        case 39: //right arrow (stop rotating ship right)
            ship.rot = 0;
            break;
    } 
}

function newAsteroid(x, y, r) {
    var levelMult = 1 + 0.1 * level;
    var roid = {
        x: x,
        y: y,
        xv: Math.random() * roidSpeed * levelMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * roidSpeed * levelMult / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2, //in radians
        vert: Math.floor(Math.random() * (roidVert + 1) + roidVert / 2),
        offs: []
    };

    //create the vertex offsets array
    for (var i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * roidJag * 2 + 1 - roidJag);
    }

    return roid;
}

function newGame() {
    level = 0;
    lives = gameLives;
    ship = newShip();
    newLevel();

}

function newLevel() {
    text = "Level" + (level + 1);
    textAlpha = 1.0;
    createAsteroidBelt();
}

function newShip() {
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        r: shipSize / 2,
        a: 90/ 180 * Math.PI, //convert to radians
        blinkTime: Math.ceil(shipBlinkDur * FPS),
        blinkNum: Math.ceil(shipInvDur / shipBlinkDur),
        canShoot: true,
        dead: false,
        explodeTime: 0,
        lasers: [],
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser() {
    //create the laser object
    if (ship.canShoot && ship.lasers.length < laserMax) {
        ship.lasers.push({
            x: ship.x + 4/3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4/3 * ship.r * Math.sin(ship.a),
            xv: laserSpeed * Math.cos(ship.a) / FPS, 
            yv: -laserSpeed * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0,
        })
    }

    //prevent further shooting
    ship.canShoot = false;
}

function update() {
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0;

    //draw space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // thrust the ship
    if (ship.thrusting && !ship.dead) {
        ship.thrust.x += shipThrust * Math.cos(ship.a) / FPS;
        ship.thrust.y -= shipThrust * Math.sin(ship.a) / FPS;

      // draw the thruster
      if(!exploding && blinkOn) {
      ctx.fillStyle = "red";
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = shipSize/10;
        ctx.beginPath();
         //   rear left of ship
         ctx.moveTo(
            ship.x - ship.r * (2/3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2/3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
         );
        //   rear center behind the ship
        ctx.lineTo(
            ship.x - ship.r * 6/3 * Math.cos(ship.a),
            ship.y + ship.r * 6/3 * Math.sin(ship.a)
         );
     //   rear right of ship
         ctx.lineTo(
            ship.x - ship.r * (2/3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2/3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
         );
        //   closePath completes the triangle making up the ship
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    else {
        ship.thrust.x -= friction * ship.thrust.x / FPS;
        ship.thrust.y -= friction * ship.thrust.y / FPS;

        
     }
    

    //Creates Bounding Circle around ship for testing
    if (showBounding) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    //   draw the asteroids
    var x, y, r, a, vert, offs;
    for (var i = 0; i < roids.length; i++) {
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = shipSize/20;
        
        //get the asteroid properties
        x = roids[i].x;
        y = roids[i].y;
        r = roids[i].r;
        a = roids[i].a;
        vert = roids[i].vert;
        offs = roids[i].offs;

        // draw a path
        ctx.beginPath();
        ctx.moveTo(
          x + r * offs[0] * Math.cos(a),
          y + r * offs[0] * Math.sin(a)
        );
        // draw the polygon
        for (var j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert),

            );
        }
        ctx.closePath();
        ctx.stroke();

     //draw a triangular ship
     if(!exploding) {
      if (blinkOn && !ship.dead) {
        drawShip(ship.x, ship.y, ship.a);
      }

      //handle blinking
      if(ship.blinkNum > 0) {
        //reduce the blink time
        ship.blinkTime--;

        //reduce the blink num
        if (ship.blinkTime == 0) {
            ship.blinkTime = Math.ceil(shipBlinkDur * FPS);
            ship.blinkNum--;
        }
      }
    }

    else {
        // draw the explosion
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }

        //Creates bounding circles for Asteroids
        if (showBounding) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.stroke();
      }   
    }

    //draw the lasers
    for (var i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime == 0) {
        ctx.fillStyle = "salmon";
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, shipSize / 15, 0, Math.PI * 2, false);
        ctx.fill();
        }
        else {
            //draw the explosion
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
            
        }
    }

    //draw the game text
    if  (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")"; 
        ctx.font = "small-caps" + textSize + "px dejavu sans mono";
        ctx.fillText(text, canv.width / 2, canv.height * 0.75);
        textAlpha -= (1.0 / textFadeTime / FPS);
    }
    else if (ship.dead) {
        newGame();
    }

    //draw the lives
    var lifeColor;
    for (var i = 0; i < lives; i++) {
        lifeColor = exploding && i == lives - 1 ? "red" : "white";
        drawShip(shipSize + i * shipSize * 1.2, shipSize, 0.5 * Math.PI, lifeColor);
    }

    //detect laser hits on asteroids
    var ax, ay, ar, lx, ly;
    for (var i = roids.length - 1; i >= 0; i--) {

        //grab asteroid properties
        ax = roids[i].x;
        ay = roids[i].y;
        ar = roids[i].r;

        //loop over the lasers
        for (var j = ship.lasers.length - 1; j >= 0; j--) {
            
            //grab laser properties
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

        //detect hits
        if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar){


            //destroy the asteroid and activate laser explosion
            destroyAsteroid(i);
            ship.lasers[j].explodeTime = Math.ceil(laserExplodeDur * FPS);

            break;
        }

        }
    }
   
    
    //check for asteroid collisions
    if(!exploding) {
      if (ship.blinkNum == 0 && !ship.dead) {
        for(var i = 0; i < roids.length; i++) {
        if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
            explodeShip();
            destroyAsteroid(i);
            break;
        }
      }
    }
    

      //rotate ship
    ship.a += ship.rot;
    
    //move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
}
else {
    //reduce explode time
    ship.explodeTime--;

    if(ship.explodeTime == 0) {
        lives--;
        if (lives == 0) {
            gameOver();
        }
        else {
        ship = newShip();  
    }
}
}

    // handle edge of screen
    if (ship.x < 0 - ship.r) {
        ship.x = canv.width + ship.r;
    }
    else if (ship.x > canv.width + ship.r) {
        ship.x= 0 - ship.r;
    };
    
    if (ship.y < 0 - ship.r) {
        ship.y = canv.height + ship.r;
    }
    else if (ship.y > canv.height + ship.r) {
        ship.y= 0 - ship.r;
    };

    //move the lasers
    for (var i = ship.lasers.length - 1; i >= 0; i--) {
        
        //check distance travelled
        if (ship.lasers[i].dist > laserDist * canv.width) {
            ship.lasers.splice(i, 1);
            continue;
        }
    
   //handle the explosion
   if (ship.lasers[i].explodeTime > 0) {
    ship.lasers[i].explodeTime--;

    //destory the laser after the duration is up
    if(ship.lasers[i].explodeTime ==0) {
        ship.lasers.splice(i, 1);
        continue;
    }
   }
   else {
   //move the laser
        ship.lasers[i].x += ship.lasers[i].xv;
        ship.lasers[i].y += ship.lasers[i].yv;

    //calculate the distance traveled
    ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2))
   }
    
   //handle edge of screen
    if(ship.lasers[i].x < 0) {
        ship.lasers[i].x = canv.width;
    }
    else if (ship.lasers[i].x > canv.width) {
        ship.lasers[i].x = 0;
    }
    
    if(ship.lasers[i].y < 0) {
        ship.lasers[i].y = canv.height;
    }
    else if (ship.lasers[i].y > canv.height) {
        ship.lasers[i].y = 0;
    }
    }

    // move the asteroid
     for(var i = 0; i < roids.length; i++) {
    roids[i].x += roids[i].xv;
    roids[i].y += roids[i].yv;

    // handle edge of screen
        if (roids[i].x < 0 - roids[i].r) {
            roids[i].x = canv.width + roids[i].r;
        }
        else if (roids[i].x > canv.width + roids[i].r) {
            roids[i].x = 0 - roids[i].r
        }

        if (roids[i].y < 0 - roids[i].r) {
            roids[i].y = canv.height + roids[i].r;
        }
        else if (roids[i].y > canv.height + roids[i].r) {
            roids[i].y = 0 - roids[i].r
        }
     }
    }

var Collision = require('./collision');

function Dinosaur(canvas, bubOrBob) {
  this.height = 25;
  this.width = 25;
  this.x = canvas.width / 2;
  this.y = canvas.height - this.height-10;
  this.status = null;
  this.direction = "right";
  if (bubOrBob === "bob") {
    this.dino_img_left = createImage("images/bob_left.png");
    this.dino_img_left_1 = createImage("images/bob_left_1.png");
    this.dino_img_left_2 = createImage("images/bob_left_2.png");
    this.dino_img_right = createImage("images/bob_right.png");
    this.dino_img_right_1 = createImage("images/bob_right_1.png");
    this.dino_img_right_2 = createImage("images/bob_right_2.png");
  } else {
    this.dino_img_left = createImage("images/bub_left.png");
    this.dino_img_left_1 = createImage("images/bub_left_1.png");
    this.dino_img_left_2 = createImage("images/bub_left_2.png");
    this.dino_img_right = createImage("images/bub_right.png");
    this.dino_img_right_1 = createImage("images/bub_right_1.png");
    this.dino_img_right_2 = createImage("images/bub_right_2.png");
  }
  this.count = 0;
  this.canvas = canvas;
  this.points = 0;
  this.rebornTime = 0;
  this.lives = 3;
  this.jumpSteps = 20;
  this.jumpTotal = 150;
  this.jumpSize = this.jumpTotal/this.jumpSteps;
  this.level = 1;
  this.floorHeight = 10;
}

Dinosaur.prototype.reborn = function() {
  if (this.rebornTime === 0) {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height - this.height - this.floorHeight;
    this.direction = "right";
    this.rebornTime = 150;
    this.lives--;
    resetDino(this);
  }
};

// These perhaps should be getters instead of functions
Dinosaur.prototype.mouthX = function() {
  if (this.direction === "right"){
    return this.x + this.width;
  }
  return this.x-30;
};

Dinosaur.prototype.mouthY = function() {
  return this.y;
};

Dinosaur.prototype.dino_img = function() {
  if (this.direction === "right" && this.rebornTime >= 75) {
    return this.dino_img_right_1;
  } else if (this.direction === "right" && (this.rebornTime > 0 && this.rebornTime < 75)) {
    return this.dino_img_right_2;
  } else if (this.direction === "right") {
    return this.dino_img_right;
  } else if (this.direction === "left" && this.rebornTime >= 75) {
    return this.dino_img_left_1;
  } else if (this.direction === "left" && (this.rebornTime > 0 && this.rebornTime < 75)) {
    return this.dino_img_left_2;
  } else if (this.direction === "left") {
    return this.dino_img_left;
  }
};

Dinosaur.prototype.draw = function(context) {
  context.drawImage(this.dino_img(), this.x, this.y, this.width, this.height);
  return this;
};

Dinosaur.prototype.left = function(game) {
  var verticalFloors = findVerticalFloors(game.floors());
  if (runIntoVerticalFloor(this, verticalFloors, "left") && notOnTopWall(this)) {
    this.x = this.x;
  } else if (this.x > 4) {
    this.x -= 2;
  } else {
    this.x = 0;
  }
  this.direction = "left";
  return this;
};

Dinosaur.prototype.right = function(game) {
  var verticalFloors = findVerticalFloors(game.floors());
  if (runIntoVerticalFloor(this, verticalFloors, "right") && notOnTopWall(this)) {
    this.x = this.x;
  } else if (this.x < this.canvas.width - this.width) {
    this.x += 2;
  } else {
    this.x = this.canvas.width - this.width;
  }
  this.direction = "right";
  return this;
};

Dinosaur.prototype.move = function(floors) {
  if (this.rebornTime > 0) {
    this.rebornTime--;
  }
  if (this.status === "jumping") {
    this.jump(floors);
  }
  if (!onAFloor(floors, this)) {
    this.y += 2;
  }
  return this;
};

Dinosaur.prototype.jump = function(floors) {
  var dino = this;
  if ( stillJumpingUp(dino) ){
    dontHitCeiling(dino);
  } else if (jumpingDown(dino)) {
    findNearestFloor(floors, dino);
  } else if (finishedJumpingAndFalling(dino)) {
    resetDino(dino);
  }
  return dino;
};

Dinosaur.prototype.setJumpingStatus = function() {
  if (!this.status) { this.status = "jumping"; }
};

function onThisFloor(floor, dino) {
  var dino_collider = { x: dino.x + dino.width / 2, y: dino.y + dino.height };
  var floor_receiver = { minX: floor.x,
                         maxX: floor.x+floor.width,
                         minY: floor.y,
                         maxY: floor.y+floor.height };
  if(Collision.collision(dino_collider, floor_receiver)) {
    return true;
  }
}

function stillJumpingUp(dino) {
  return dino.count < dino.jumpSteps;
}

function jumpingDown(dino) {
  return dino.count >= dino.jumpSteps && dino.count < 2 * dino.jumpSteps;
}

function finishedJumpingAndFalling(dino) {
  return dino.count === 2 * dino.jumpSteps;
}

function resetDino(dino) {
  dino.status = null;
  dino.count = 0;
}

function findNearestFloor(floors, dino){
  dino.count++;
  floors.forEach(function(floor){
    if (onThisFloor(floor, dino)) {
      dino.y = floor.y-floor.height/2-dino.height-2;
      resetDino(dino);
    }
  });
  dino.y += dino.jumpSize;
  return dino;
}

function dontHitCeiling(dino) {
  dino.count++;
  if (dino.y - dino.jumpSize > 0){
    dino.y -= dino.jumpSize;
  } else {
    dino.y = 0;
    dino.count = dino.jumpSteps;
  }
}

function createImage(imageSrc) {
  var image = document.createElement("img");
  image.src = imageSrc;
  image.style.visibility = 'hidden';
  return image;
}

function onAFloor(floors, dino) {
  var floor;
  for(var i = 0; i< floors.length; i++) {
    floor = floors[i];
    if (onThisFloor(floor, dino)) {
      return true;
    }
  }
  return false;
}

function findVerticalFloors(floors){
  var verticalFloors = [];
  floors.forEach(function(floor){
    if (floor.height > 10) {
      verticalFloors.push(floor);
    }
  });
  return verticalFloors;
}

function runIntoVerticalFloor(dino, verticalFloors, direction){
  for (var i = 0; i < verticalFloors.length; i++) {
    var dino_collider = Collision.generateReceiver(dino);
    var floor_receiver = Collision.generateReceiver(verticalFloors[i]);
    if (Collision.collisionVertical(dino_collider, floor_receiver, direction)) {
      return true;
    }
  }
  return false;
}

function notOnTopWall(dino){
  return !(dino.y > 30 && dino.y < 34);
}



module.exports = Dinosaur;

let simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

//Reading the plan(level)
class Level {
  constructor(plan) {
    let rows = plan.trim().split("\n").map( l => [...l]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelChars[ch];
        if(typeof type === 'string') return type;
        this.startActors.push(
          type.create(new Vec(x,y), ch));]
        return "empty";       
      });
    });
  }
}

//Reading the state of the game
class State {
  constructor(levels , actors, status) {
    this.levels = levels;
    this.actors = actors;
    this.status = status;
  }

  static start(level) {
    return new State(level, level.startActors, "playing");
  }

  get player() {
    return this.actors.find( a => a.type === 'player');
  }
}

//Class for get position and size of the vector
class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(other) {
    return new Vec(this.x + other.x , this.y + other.y);
  }

  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
}

// make a Player class for making our player
class Player {
  constructor(pos, speed) {
    this.pos = pos;
    this.speed = speed;
  }

  get type() {
    return "player";
    
  }
  static create(pos) {
    return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0,0));
  }
}

Player.prototype.size = new Vec(0.8, 1.5);

// make a class of Lava
class Lava {
  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
  }

  get type() {
    return "lava";
  }

  static create(pos, ch) {
    if(ch === '=') {
      return new Lava(pos, new Vec(2,0));
    } else if(ch === '|') {
      return new Lava(pos, new Vec(0, 2));
    } else if(ch === 'v') {
      return new Lava(pos, new Vec(0,3), pos)
    }
  }
}

Lava.prototype.size = new Vec(1, 1);

// class for coin
class Coin {
  constructor(pos, basePos, wobble) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
  }

  get type() {
    return 'coin';
  }

  static create(pos) {
    let basePos = pos.plus(new Vec(0.2, 0.1));
    return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
  }
}

Coin.prototype.size = new Vec(0.6, 0.6);

//object that defines the characters which are as grid bacground and which are members of actor group
const levelChars = {
  "." : "empty", 
  "#" : "wall", 
  "+" : "lava",
  "@" : Player, 
  "o" : Coin, 
  "|" : Lava,
  "=" : Lava,
  "v" : Lava
};

// helper function to create an element.
function elt(name, attrs, ...children) {
  let dom = document.createElement(name);
  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }
  for (let child of children) {
    dom.appendChild(child);
  }
  return dom;
}

// class for create level to it's parent element
class DOMDisplay {
  constructor(parent, level) {
    this.dom = elt("div", {class: "game"}, drawGrid(level));
    this.actorLayer = null;
    parent.appendChild(this.dom);
  }

  clear() { this.dom.remove(); }
}
const scale = 20;

//function to draw a level
function drawGrid(level) {
  return elt("table", {
    class: "background",
    style: `width: ${level.width * scale}px`
  }, ...level.rows.map(row =>
    elt("tr", {style: `height: ${scale}px`},
        ...row.map(type => elt("td", {class: type})))
  ));
}
// function for drawActor 

function drawActors(actors) {
  return elt("div", {}, ...actors.map(actor => {
    let rect = elt("div", {class: `actor ${actor.type}`});
    rect.style.width = `${actor.size.x * scale}px`;
    rect.style.height = `${actor.size.y * scale}px`;
    rect.style.left = ` ${actor.pos.x * scale}px`;
    rect.style.top = `${actor.pos.y * scale}px`;
    return rect;
  }));
}

// add a method to DomDisplay to sync with the state of the game
DOMDisplay.prototype.syncState = function(state) {
  if (this.actorLayer) this.actorLayer.remove();
  this.actorLayer = drawActors(state.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${state.status}`;
  this.scrollPlayerIntoView(state);
};

// method on DOMDisplay to make player in the view
DOMDisplay.prototype.scrollPlayerIntoView = function (state) {
  let width = this.dom.clientWidth;
  let height = this.dom.clientHeight;
  let margin = width / 3;

  // The viewport
  let left = this.dom.scrollLeft, right = left + width;
  let top = this.dom.scrollTop, bottom = top + height;

  let player = state.player;
  let center = player.pos.plus(player.size.times(0.5)).times(scale);

  if(center.x < left + margin) {
    this.dom.scrollLeft = center.x - margin;
  } else if(center.x > right - margin) {
    this.dom.scrollLeft = center.x + margin - width;
  }
  if(center. y < top + margin) {
    this.dom.scrollTop = center.y - margin;
  } else if(center.y > bottom - margin) {
    this.dom.scrollTop = center.y + margin + height;
  }
};

// method to check wheater players touches the wall or not
Level.prototype.touches = function(pos, size, type) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  for(var y = yStart; y < yEnd; y++) {
    for(var x = xStart; x < xEnd; x++) {
      let isOutSide = x < 0 || x >= this.width || y < 0 || y >= this.height;
      let here = isOutSide ? "wall" : this.rows[x][y];
      if(here === type) return true; 
    }
  }
  return false;
}

// methods uses toches methods to checks wheather player collide with lava
State.prototype.update = function(time, keys) {
  let actors = this.actors.map(actor => actor.update(time, this, keys));
  let newState = new State(this.level, actor, this.status);

  if(newState.status != "playing") return newState;

  let player = newState.player;
  if(this.level.touches(player.pos, player.size, "lava")) {
    return new State(this.level, actors, "lost");
  }

  for(let actor of actors ) {
    if(actor != player && overlap(actor, player)) {
      newState = actor.collide(newState);
    }
  }
  return newState;
}

// function that checks two objects collide or not 
function overlap(actor1, actor2) {
  return actor1.pos.x + actor1.size.x > actor2.pos.x &&
         actor1.pos.x < actor2.pos.x + actor2.size.x &&
         actor1.pos.y + actor1.size.y > actor2.pos.y &&
         actor1.pos.y < actor2.pos.y + actor2.size.y;
}

// If two object overlap then collide method update the state of the game
Lava.prototype.collide = function(state) {
  return new State(state,level, state.actors, "lost");
};

Coin.prototype.collide = function(state) {
  let filtered = state.actors.filter(a => a != this);
  let status = state.status;
  if(!filtered.some(a => a.type === "coin")) status = "won";
  return new State(state.level, filtered, status);
};

//method for update position of the lava
Lava.prototype.update = function(time, state) {
  let newPos = this.pos.plus(this.speed.times(time));
  if(!state.level.touches(newPos, this.size, "wall")) {
    return new Lava(newPos, this.speed, this.reset);
  } else if(this.reset) {
    return new Lava(this.reset, this.speed, this.reset);
  } else {
    return new Lava(this.pos, this.speed.times(-1));
  }
};

// method for update position of coin
const wobbleSpeed = 8, wobbleDist = 0.07;

Coin.prototype.update = function(time) {
  let wobble = this.wobble + time * wobbleSpeed;
  let wobblePos = Math.sin(wobble) * wobbleDist;
  return new Coin(this.basePos.plus(new Vec(0, wobblePos)), this.basePos, wobble);
};

// Update the player method
const playerXSpeed = 7;
const gravity = 30;
const jumpSpeed = 17;

Player.prototype.update = function(time, state, keys) {
  let xSpeed = 0;
  if(keys.ArrowLeft) {
    xSpeed -= playerXSpeed;
  }
  if(keys.ArrowRight) {
    xSpeed += playerXSpeed;
  }
  let pos = this.pos;
  let movedX = pos.plus(new Vec(xSpeed * time, 0));
  if(!state.level.touches(movedX, this.size, "wall")) {
    pos = movedX;
  }

  let ySpeed = this.speed + time * gravity;
  let movedY = pos.plus(new Vec(0, ySpeed * time));
  if(!state.level.touches(movedY, this.size, "wall")) {
    pos = movedY;
  } else if(keys.ArrowUp && ySpeed > 0) {
    ySpeed = -jumpSpeed;
  } else {
    ySpeed = 0;
  }
  return new Player(pox, new Vec(xSpeed, ySpeed);)
}

// function for keep track of the keys
function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
    if(keys.includes(event.key)) {
      down[event.key] = event.type === 'keydown';
      event.preventDefault();
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);
  return down;
}

const arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);
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
          type.create(new Vector(x,y), ch));
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
    return new State(level, level.actors, "playing");
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
    return new Coin(basePos, basePos, Math.random() * Math.PI() * 2);
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
  for(let attr of Object.keys(attrs)) {
    dom.setAttribute(attrs, attrs[attr]);
  }
  for(let child of children) {
    dom.appendChild(child);
  }
  return dom;
}

// class for create level to it's parent element
class DOMDisplay {
  constructor(parent, level) {
    this.dom = elt("div", {class : "game"}, drawGrid(level));
    this.actorLayer = null;
    parent.appendChild(level);
  }

  clear() {
    this.dom.remove();
  }
}

const scale = 20;

//function to draw a level
function drawGrid(level) {
  return elt("table", {
    class : "background",
    style : `width : ${level.width * scale}px`
  }, ...levels.rows.map(row => {
    elt("tr", {style : `height : ${scale}px`}, ...row.map(type => {
      elt("td", {class : type});
    }));
  }));
}

// function for drawActor 
function drawActor(actors) {
  return elt("div", {}, ...actors.map(actor => {
    let rect = elt("div", {class : `actor ${actor.type}`});
    rect.style.width = `${actor.size.x * scale}px`;
    rect.style.height = `${actor.size.y * scale}px`;
    rect.style.left = `${actor.pos.x * scale}px`;
    rect.style.top = `${actor.pos.y * scale}px`;
  }));
}

// add a method to DomDisplay to sync with the state of the game
DOMDisplay.prototype.syncState = function(state) {
  if(this.actorLayer) {
    this.actorLayer.remove();
  }
  this.actorLayer = drawActor(state.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${state.status}`;
  this.scrollPlayerIntoView(state);
}

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
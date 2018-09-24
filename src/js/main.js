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

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


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
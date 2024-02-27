const shuffle = require('./helpers/shuffle');

class SummyBearsGame {
  constructor(config) {
    this.config = SummyBearsGame.DefaultConfig;
    this.values = shuffle(Array.from(this.config.values));
    this.pulls = 0;
    this.totalBears = 0;
  }

  pullLever(leverIndex) {
    if (leverIndex < 1 || leverIndex > this.values.length) {
      throw new Error('Invalid lever index');
    }
    this.pulls += 1;
    const bears = this.values[leverIndex - 1];
    this.totalBears += bears;
    return bears;
  }

  isGameOver() {
    return this.pulls >= this.config.pullsPerGame;
  }

  getPullsLeft() {
    return this.config.pullsPerGame - this.pulls;
  }

  getScore() {
    return this.totalBears;
  }
}

SummyBearsGame.DefaultConfig = {
  values: [1, 1, 2, 3, 5, 7, 9, 15, 25],
  pullsPerGame: 9,
};

module.exports = SummyBearsGame;

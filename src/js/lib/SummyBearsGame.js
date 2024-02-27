const shuffle = require('./helpers/shuffle');

class SummyBearsGame {
  constructor(config) {
    this.config = config;
    this.values = shuffle(Array.from(this.config.game.values));
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
    return this.pulls >= this.config.game.pullsPerGame;
  }

  getPullsLeft() {
    return this.config.game.pullsPerGame - this.pulls;
  }

  getScore() {
    return this.totalBears;
  }
}

module.exports = SummyBearsGame;

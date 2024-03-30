const SummyBearsView = require('./SummyBearsView');
const SummyBearsGame = require('./SummyBearsGame');

class SummyBearsApp {
  constructor(config, container) {
    this.config = config;
    this.container = container;
    this.view = new SummyBearsView(this.config);
    this.idleTimer = null;

    // Todo: Add config flag check
    $(document).on('keydown', (event) => {
      if (event.code === 'KeyD') {
        this.view.toggleDebugGui();
      }
      if (event.code === 'KeyX') {
        this.view.clearAllBears();
      }
      if (event.code === 'KeyB') {
        this.view.processBearBatch();
      }
      // If a number 1-9 was pressed, add bears to that chute
      const chuteNumber = parseInt(event.key, 10);
      if (chuteNumber >= 1 && chuteNumber <= 9) {
        this.view.triggerLeverPull(chuteNumber);
      }
    });

    this.view.events.on('lever-pull', this.handleLeverPull.bind(this));
    this.view.events.on(
      'bear-process-done',
      this.handleBearProcessDone.bind(this)
    );
    this.view.events.on('new-game', this.handleNewGame.bind(this));

    this.game = null;
    this.startNewGame();
  }

  getHtmlElement() {
    return this.view.getHtmlElement();
  }

  startNewGame() {
    this.clearIdleTimer();
    this.game = new SummyBearsGame(this.config);
    this.view.reset();
    this.view.showPullsLeft(this.game.getPullsLeft());
  }

  handleLeverPull(leverIndex) {
    this.resetIdleTimer();
    const bears = this.game.pullLever(leverIndex);
    this.view.expelBears(leverIndex, bears);
    this.view.showLeverText(leverIndex, bears);
    this.view.showPullsLeft(this.game.getPullsLeft());
    if (this.game.isGameOver()) {
      this.handleGameOver();
    }
  }

  handleGameOver() {
    this.clearIdleTimer();
    this.view.disableLevers();
    this.view.queueBearProcessing();
  }

  handleBearProcessDone() {
    this.resetIdleTimer();
    this.view.bearSignMarquee.turnOn();
    this.view.counter.setTarget(this.game.getScore());
    this.view.hidePullsLeft();
    setTimeout(() => {
      this.view.showNewGameSign();
    }, 1000);
  }

  handleNewGame() {
    this.startNewGame();
  }

  resetIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    const delay = this.game.isGameOver()
      ? this.config.app.autoRestartTimeout
      : this.config.app.idleRestartTimeout;

    if (delay) {
      this.idleTimer = setTimeout(() => {
        this.startNewGame();
      }, delay);
    }
  }

  clearIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}

module.exports = SummyBearsApp;

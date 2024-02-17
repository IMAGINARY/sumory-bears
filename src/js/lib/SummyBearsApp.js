const SummyBearsView = require('./SummyBearsView');

class SummyBearsApp {
  constructor(config, container) {
    this.config = config;
    this.container = container;
    this.view = new SummyBearsView(this.config);

    // Todo: Add config flag check
    $(document).on('keydown', (event) => {
      if (event.code === 'KeyD') {
        this.view.toggleDebugGui();
      }
      if (event.code === 'KeyX') {
        this.view.clearAllBears();
      }
      if (event.code === 'KeyB') {
        this.view.toggleBox();
      }
      // If a number 1-9 was pressed, add bears to that chute
      const chuteNumber = parseInt(event.key, 10);
      if (chuteNumber >= 1 && chuteNumber <= 9) {
        this.view.addBears(chuteNumber, 20);
      }
    });
  }

  getHtmlElement() {
    return this.view.getHtmlElement();
  }
}

module.exports = SummyBearsApp;

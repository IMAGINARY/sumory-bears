class Lever {
  constructor() {
    this.$element = $('<div></div>')
      .addClass('lever')
      .on('pointerdown', this.handleAction.bind(this));
    this.$body = $('<div></div>')
      .addClass('lever-body')
      .appendTo(this.$element);
    this.$handle = $('<div></div>')
      .addClass('lever-handle')
      .appendTo(this.$element);
    this.$knob = $('<div></div>')
      .addClass('lever-knob')
      .appendTo(this.$element);
    this.$shadow = $('<div></div>')
      .addClass('lever-shadow')
      .appendTo(this.$element);
    this.$text = $('<div></div>')
      .addClass('lever-text')
      .appendTo(this.$element);
    this.$eventMask = $('<div></div>')
      .addClass('lever-event-mask')
      .appendTo(this.$element);

    this.showText('20');

    this.isUp = true;
    this.isDisabled = false;
  }

  handleAction() {
    if (this.isDisabled) {
      return;
    }
    if (this.isUp) {
      this.pullDown();
    } else {
      this.pullUp();
    }
  }

  pullDown() {
    this.isUp = false;
    this.$element.removeClass('lever-up');
    this.$element.addClass('lever-down');
  }

  pullUp() {
    this.isUp = true;
    this.$element.removeClass('lever-down');
    this.$element.addClass('lever-up');
  }

  showText(text) {
    this.$text.html(text);
    this.$element.addClass('with-text');
  }

  hideText() {
    this.$element.removeClass('with-text');
  }
}

module.exports = Lever;

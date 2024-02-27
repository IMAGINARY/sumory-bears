const EventEmitter = require('events');

class Lever {
  constructor() {
    this.events = new EventEmitter();

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
    this.$light = $('<div></div>')
      .addClass('lever-light')
      .appendTo(this.$element);
    this.$eventMask = $('<div></div>')
      .addClass('lever-event-mask')
      .appendTo(this.$element);

    this.isUp = true;
    this.state = Lever.State.enabled;
  }

  handleAction() {
    if (this.state !== Lever.State.enabled) {
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
    this.disable(true);
    this.$element.removeClass('lever-up');
    this.$element.addClass('lever-down');
    this.events.emit('pull-down');
  }

  pullUp() {
    this.isUp = true;
    this.$element.removeClass('lever-down');
    this.$element.addClass('lever-up');
    this.events.emit('pull-up');
    if (this.state !== Lever.State.disabled) {
      this.enable();
    }
  }

  showText(text) {
    this.$text.html(text);
    this.$element.addClass('with-text');
  }

  hideText() {
    this.$element.removeClass('with-text');
  }

  hasText() {
    return this.$element.hasClass('with-text');
  }

  disable(temporary = false) {
    this.state = temporary
      ? Lever.State.disabledTemporarily
      : Lever.State.disabled;
    this.$light.addClass('off');
  }

  enable() {
    this.state = Lever.State.enabled;
    this.$light.removeClass('off');
  }

  reset() {
    this.pullUp();
    this.hideText();
  }
}

Lever.State = {
  enabled: 'enabled',
  disabledTemporarily: 'disabled-temporarily',
  disabled: 'disabled',
};

module.exports = Lever;

class Marquee {
  constructor(hLightCount, vLightCount) {
    this.$element = $('<div></div>').addClass('marquee');
    this.lights = [];
    // Create the top row lights
    this.$topRow = $('<div></div>')
      .addClass(['marquee-row', 'marquee-row-top'])
      .appendTo(this.$element);
    this.$columnContainer = $('<div></div>')
      .addClass('marquee-column-container')
      .appendTo(this.$element);
    this.$leftColumn = $('<div></div>')
      .addClass(['marquee-column', 'marquee-column-left'])
      .appendTo(this.$columnContainer);
    this.$rightColumn = $('<div></div>')
      .addClass(['marquee-column', 'marquee-column-right'])
      .appendTo(this.$columnContainer);
    this.$bottomRow = $('<div></div>')
      .addClass(['marquee-row', 'marquee-row-bottom'])
      .appendTo(this.$element);

    const addModClass = ($el) => {
      $el.addClass([
        `marquee-light-mod2-${this.lights.length % 2}`,
        `marquee-light-mod3-${this.lights.length % 3}`,
        `marquee-light-mod4-${this.lights.length % 4}`,
      ]);
    };
    for (let i = 0; i < hLightCount; i += 1) {
      const $light = $('<div></div>').addClass('marquee-light');
      addModClass($light);
      this.lights.push($light);
      this.$topRow.append($light);
    }
    const createSpacer = () => $('<div></div>').addClass('marquee-spacer');
    this.$leftColumn.append(createSpacer());
    this.$rightColumn.append(createSpacer());

    for (let i = 0; i < vLightCount; i += 1) {
      const $light = $('<div></div>').addClass('marquee-light');
      addModClass($light);
      this.lights.push($light);
      this.$rightColumn.append($light);
    }
    for (let i = 0; i < hLightCount; i += 1) {
      const $light = $('<div></div>').addClass('marquee-light');
      addModClass($light);
      this.lights.push($light);
      this.$bottomRow.append($light);
    }
    this.$rightColumn.append(createSpacer());

    for (let i = 0; i < vLightCount; i += 1) {
      const $light = $('<div></div>').addClass('marquee-light');
      addModClass($light);
      this.lights.push($light);
      this.$leftColumn.append($light);
    }
    this.$leftColumn.append(createSpacer());
  }

  turnOn() {
    this.$element.addClass('marquee-on');
  }

  turnOff() {
    this.$element.removeClass('marquee-on');
  }
}

module.exports = Marquee;

class Chute {
  constructor(x, length, config) {
    this.config = config;
    const animationDuration = this.config.app.bearExpelAnimationDuration;

    this.$element = $('<div></div>')
      .addClass('chute')
      .css('left', x)
      .append(
        $('<div></div>')
          .addClass('pipe')
          .append(
            $('<div></div>')
              .addClass('body')
              .css('height', length)
              .css('animation-duration', animationDuration)
          )
          .append(
            $('<div></div>')
              .addClass('end')
              .append($('<div></div>').addClass('ring'))
              .append(
                $('<div></div>')
                  .addClass('tip')
                  .css('animation-duration', animationDuration)
              )
          )
      )
      .append(
        $('<div></div>')
          .addClass('guides')
          .append($('<div></div>').addClass(['guide', 'top']))
          .append($('<div></div>').addClass(['guide', 'bottom']))
      );
  }
}

module.exports = Chute;

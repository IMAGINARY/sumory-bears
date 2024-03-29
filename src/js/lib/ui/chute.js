class Chute {
  constructor(x, length) {
    this.$element = $('<div></div>')
      .addClass('chute')
      .css('left', x)
      .append(
        $('<div></div>')
          .addClass('pipe')
          .append($('<div></div>').addClass('body').css('height', length))
          .append(
            $('<div></div>')
              .addClass('end')
              .append($('<div></div>').addClass('ring'))
              .append($('<div></div>').addClass('tip'))
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

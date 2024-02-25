class RotaryCounter {
  constructor(digitCount, options = {}) {
    this.digitCount = digitCount;
    this.options = { ...RotaryCounter.defaultOptions, ...options };

    this.$element = $('<div></div>').addClass('rotary-counter');
    this.slots = [];
    for (let i = 0; i < this.digitCount; i += 1) {
      const $slot = $('<div></div>')
        .addClass('rotary-counter-slot')
        .on('animationend', (event) => this.handleSlotAnimationEnd(i, event))
        .on('animationcancel', (event) =>
          this.handleSlotAnimationCancel(i, event)
        )
        .appendTo(this.$element);
      const steps = [
        $('<div></div>').addClass('rotary-counter-slot-step').appendTo($slot),
        $('<div></div>').addClass('rotary-counter-slot-step').appendTo($slot),
      ];

      this.slots.push({
        element: $slot,
        steps,
        currentStep: 0,
        isAnimating: false,
        isEven: false,
      });
    }

    this.reset();
  }

  reset() {
    this.slots.forEach((slot) => {
      slot.currentStep = 0;
      slot.steps[0].text(this.options.digits[0]);
      slot.steps[1].text(this.options.digits[1]);
    });
    this.setTarget(this.options.digits[0].repeat(this.digitCount));
  }

  setTarget(target) {
    const targetString = target.toString();
    const { digits } = this.options;

    if (!targetString.split('').every((char) => digits.includes(char))) {
      throw new Error('Target string contains invalid characters');
    }
    // Pad the target string with leading digits[0] if necessary
    this.target = targetString.padStart(this.digitCount, digits[0]);
    // Animate any slots that need to change
    this.slots.forEach((slot, i) => {
      if (slot.currentStep !== digits.indexOf(this.target[i])) {
        this.startSlotAnimation(i);
      }
    });
  }

  startSlotAnimation(slotIndex) {
    const slot = this.slots[slotIndex];
    if (slot.isAnimating) {
      return;
    }
    slot.isAnimating = true;
    slot.element.addClass(`animate-${slot.isEven ? 'even' : 'odd'}`);
    slot.isEven = !slot.isEven;
  }

  stopSlotAnimation(slotIndex) {
    const slot = this.slots[slotIndex];
    slot.isAnimating = false;
    slot.element.removeClass(`animate-even animate-odd`);
  }

  handleSlotAnimationEnd(slotIndex) {
    this.stopSlotAnimation(slotIndex);
    const slot = this.slots[slotIndex];
    slot.steps[0].text(this.options.digits[(slot.currentStep + 1) % 10]);
    slot.steps[1].text(this.options.digits[(slot.currentStep + 2) % 10]);
    slot.currentStep = (slot.currentStep + 1) % 10;

    // If the slot hasn't reached the target value, animate it again
    if (this.target[slotIndex] !== this.options.digits[slot.currentStep]) {
      this.startSlotAnimation(slotIndex);
    }
  }

  handleSlotAnimationCancel(slotIndex) {
    this.stopSlotAnimation(slotIndex);
  }
}

RotaryCounter.defaultOptions = {
  digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
};

module.exports = RotaryCounter;

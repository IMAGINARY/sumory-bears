/* globals Matter, MatterTools */
const EventEmitter = require('events');
const bearTextureApple = require('../../../static/img/sp-bear-apple.png');
const bearTextureLemon = require('../../../static/img/sp-bear-lemon.png');
const bearTextureOrange = require('../../../static/img/sp-bear-orange.png');
const bearTextureStrawberry = require('../../../static/img/sp-bear-strawberry.png');
const bearTextureGrape = require('../../../static/img/sp-bear-grape.png');
const Lever = require('./ui/lever');
const Chute = require('./ui/chute');
const RotaryCounter = require('./ui/rotary-counter');
const Marquee = require('./ui/marquee');

class SummyBearsView {
  constructor(config) {
    this.config = config;
    this.events = new EventEmitter();
    this.$element = $('<div class="summy-bears">');
    this.$bgImage = $('<div class="bg-image">');
    this.$element.append(this.$bgImage);
    this.$matterContainer = $('<div class="matter-container">');
    this.$element.append(this.$matterContainer);
    this.$uiContainer = $('<div class="ui-container">');
    this.$element.append(this.$uiContainer);

    this.transparentBodies = this.config?.matter?.transparentBodies;

    this.worldObjects = {};
    this.chutes = [];
    this.bears = [];
    this.boxMoving = false;
    this.boxIn = true;
    this.boxSpeed = 0;
    this.bearCount = 0;
    this.bearRampThreshold = {
      x: Infinity,
      y: Infinity,
    };
    this.processingBears = false;
    this.bearProcessingTimer = null;
    this.readyToProcessBears = false;

    this.debugToolsShown = false;
    this.debugGui = null;
    this.debugInspector = null;

    this.engine = Matter.Engine.create({
      enableSleeping: this.config.matter.enableSleeping,
      timing: {
        timeScale: this.config.matter.engineTimescale,
      },
    });
    this.engine.gravity.scale *= this.config.matter.gravityFactor;
    this.render = Matter.Render.create({
      element: this.$matterContainer[0],
      engine: this.engine,
      options: {
        width: this.config.stage.width,
        height: this.config.stage.height,
        wireframes: this.config.matter.wireframes,
        background: 'transparent',
        showPerformance: this.config.matter.showPerformance,
      },
    });

    this.initWorld();
    Matter.Events.on(this.engine, 'beforeUpdate', (event) => {
      if (this.boxMoving) {
        const time = (event.delta || 1000 / 60) / 1000;
        this.updateBoxPosition(time);
      }
    });
    Matter.Events.on(this.engine, 'afterUpdate', () => {
      this.checkBearPositions();
    });
    Matter.Render.run(this.render);
    this.runner = Matter.Runner.create({
      delta: this.config.matter.runnerDelta,
    });
    Matter.Runner.run(this.runner, this.engine);

    this.levers = this.chutes.map((chute, i) => {
      const lever = new Lever();
      lever.$element.appendTo(this.$uiContainer);
      lever.$element.css('left', `${chute.x}px`);
      lever.events.on('pull-down', () => {
        this.handleLeverPull(i + 1);
        setTimeout(() => {
          lever.pullUp();
        }, this.config.app.bearExpelAnimationDuration + this.config.app.leverResetDelay);
      });
      return lever;
    });

    this.chuteViews = this.chutes.map((chute) => {
      const chuteView = new Chute(chute.x, chute.height - 38, this.config);
      chuteView.$element.appendTo(this.$uiContainer);
      return chuteView;
    });

    this.pullsLeft = $('<div></div>')
      .addClass('pulls-left')
      .appendTo(this.$uiContainer);

    this.$bearSign = $('<div></div>')
      .addClass('bear-sign')
      .appendTo(this.$uiContainer);

    this.bearSignMarquee = new Marquee(9, 3);
    this.$bearSign.append(this.bearSignMarquee.$element);

    this.counter = new RotaryCounter(3);
    this.counter.$element.appendTo(this.$uiContainer);

    const appendI18nText = ($element, texts) => {
      this.config.app.languages.forEach((lang, i) => {
        $element.append(
          $('<div></div>')
            .addClass(['lang', `lang-${lang}`, `lang-${i}`])
            .html(texts?.[lang])
        );
      });
    };

    this.$instructions = $('<div></div>')
      .addClass('instructions')
      .appendTo(this.$uiContainer);
    appendI18nText(this.$instructions, this.config.i18n.instructions);

    this.$newGameSign = $('<div></div>')
      .addClass('new-game-sign visible')
      .on('pointerdown', () => {
        this.events.emit('new-game');
      })
      .appendTo(this.$uiContainer);
    appendI18nText(this.$newGameSign, this.config.i18n.newGame);
  }

  initWorld() {
    const Rectangle = Matter.Bodies.rectangle;
    const Circle = Matter.Bodies.circle;

    const rampSurface = Rectangle(630, 560, 2000, 60, {
      label: 'rampSurface',
      render: {
        fillStyle: this.transparentBodies ? 'transparent' : '#fff',
      },
    });
    const rampEnd = Circle(1630, 560, 30, {
      label: 'ramEnd',
      render: {
        fillStyle: this.transparentBodies ? 'transparent' : '#fff',
      },
    });
    this.worldObjects.ramp = Matter.Body.create({
      label: 'ramp',
      parts: [rampSurface, rampEnd],
      isStatic: true,
      staticFriction: 0.5,
      friction: 0,
    });
    Matter.Body.setAngle(
      this.worldObjects.ramp,
      this.config.ramp.angle * ((Math.PI * 2) / 360)
    );

    this.bearRampThreshold = {
      y: Math.ceil(this.worldObjects.ramp.bounds.max.y),
      x: Math.ceil(this.worldObjects.ramp.bounds.max.x),
    };

    const boxProps = {
      friction: 0.5,
      render: {
        fillStyle: '#fff',
      },
    };

    const boxLeft = Rectangle(1650, 830, 20, 140, {
      ...boxProps,
      label: 'boxLeft',
    });

    const boxRight = Rectangle(1830, 830, 20, 140, {
      ...boxProps,
      label: 'boxRight',
    });

    const boxBottom = Rectangle(1740, 890, 200, 20, {
      ...boxProps,
      label: 'boxBottom',
    });

    this.worldObjects.box = Matter.Body.create({
      label: 'box',
      parts: [boxLeft, boxRight, boxBottom],
      mass: 100,
      isStatic: true,
    });

    // Create chutes
    const chuteXs = Array.from(
      { length: this.config.chutes.count },
      (_, i) => 100 + i * this.config.chutes.spacing
    );
    chuteXs.forEach((x) => {
      const yOffset =
        (x - chuteXs[0]) * Math.tan(this.config.ramp.angle * (Math.PI / 180));
      this.addChute(
        x,
        this.config.chutes.height + yOffset,
        this.config.chutes.width,
        this.config.chutes.height + yOffset
      );
    });

    Matter.Composite.add(this.engine.world, Object.values(this.worldObjects));
  }

  getHtmlElement() {
    return this.$element[0];
  }

  /**
   * Adds a chute to the world.
   *
   * @param {number} x
   *  The x coordinate of the end of the chute.
   * @param {number} y
   *  The y coordinate of the end of the chute.
   * @param {number} width
   *  The inner width of the chute.
   * @param {number} height
   *  The height of the chute.
   */
  addChute(x, y, width, height) {
    this.chutes.push({
      x,
      y,
      height,
    });
  }

  static getRandomBearTexture() {
    const textures = [
      bearTextureApple,
      bearTextureLemon,
      bearTextureOrange,
      bearTextureStrawberry,
      bearTextureGrape,
    ];
    const index = Math.floor(Math.random() * textures.length);
    return textures[index];
  }

  createBear(x, y) {
    const newBear = {
      body: Matter.Bodies.rectangle(
        x,
        y,
        this.config.bears.width,
        this.config.bears.height,
        {
          label: 'bear',
          angle: Math.random() * Math.PI * 2,
          airFriction: this.config.bears.airFriction,
          staticFriction: this.config.bears.staticFriction,
          friction: this.config.bears.friction,
          mass: this.config.bears.mass,
          restitution: this.config.bears.restitution,
          slop: this.config.bears.slop,
          render: {
            sprite: {
              texture: SummyBearsView.getRandomBearTexture(),
              xScale: 0.5,
              yScale: 0.5,
            },
          },
        }
      ),
      counted: false,
    };
    this.bears.push(newBear);
    return newBear;
  }

  expelBears(chuteNumber, count) {
    const expelDelay = this.config.app.bearExpelDelay;
    const animationDuration = this.config.app.bearExpelAnimationDuration;

    this.chuteViews[chuteNumber - 1].$element.addClass('expelling');
    setTimeout(() => {
      this.addBears(chuteNumber, count);
      setTimeout(() => {
        this.chuteViews[chuteNumber - 1].$element.removeClass('expelling');
      }, animationDuration - expelDelay);
    }, expelDelay);
  }

  addBears(chuteNumber, count) {
    const chute = this.chutes[chuteNumber - 1];
    const bearRadius = Math.sqrt(
      this.config.bears.width ** 2 + this.config.bears.height ** 2
    );
    const bearsPerRow = Math.floor(this.config.chutes.width / bearRadius);
    const bearSpacing = this.config.chutes.width / bearsPerRow;
    const bearRows = Math.ceil(count / bearsPerRow);
    const bears = [];
    const tallestChute = Math.max(...this.chutes.map((c) => c.height));
    for (let i = 0; i < bearRows; i += 1) {
      for (let j = 0; j < bearsPerRow; j += 1) {
        const x =
          chute.x -
          this.config.chutes.width / 2 +
          bearSpacing / 2 +
          j * bearSpacing;
        const baseHeight = chute.y - tallestChute;
        const y = baseHeight - (bearRadius / 2 + i * bearRadius);
        if (i * bearsPerRow + j >= count) {
          break;
        }
        const newBear = this.createBear(x, y);
        bears.push(newBear);
      }
    }
    Matter.Composite.add(
      this.engine.world,
      bears.map((b) => b.body)
    );
  }

  checkBearPositions() {
    const removed = [];
    let allBearsCounted = true;
    this.bears.forEach((bear) => {
      if (!bear.counted && this.bearIsOffRamp(bear)) {
        bear.counted = true;
        this.bearCount += 1;
        this.counter.setTarget(this.bearCount);
      }

      if (this.bearIsOutOfBounds(bear)) {
        Matter.Composite.remove(this.engine.world, bear.body);
        removed.push(bear);
      } else if (!bear.counted) {
        allBearsCounted = false;
      }
    });
    if (removed.length) {
      this.bears = this.bears.filter((bear) => !removed.includes(bear));
    }
    if (this.readyToProcessBears && allBearsCounted) {
      this.handleAllBearsInBox();
    }
  }

  clearAllBears() {
    this.bears.forEach((bear) => {
      Matter.Composite.remove(this.engine.world, bear.body);
    });
    this.bears = [];
  }

  reset() {
    this.clearAllBears();
    this.bearCount = 0;
    this.counter.setTarget(0);
    this.resetLevers();
    this.enableLevers();
    this.slideBoxIn();
    this.bearSignMarquee.turnOff();
    this.hideNewGameSign();
  }

  showDebugGui() {
    if (!this.debugToolsShown) {
      this.debugToolsShown = true;
      this.$element.addClass('with-debug');
      this.debugGui = MatterTools.Gui.create(
        this.engine,
        this.runner,
        this.render
      );

      this.debugInspector = MatterTools.Inspector.create(
        this.engine,
        this.render
      );
    }
  }

  slideBoxOut() {
    if (this.boxMoving) {
      return;
    }
    this.boxIn = false;
    this.boxMoving = true;
  }

  slideBoxIn() {
    if (this.boxMoving) {
      return;
    }
    this.boxIn = true;
    this.boxMoving = true;
  }

  toggleBox() {
    if (this.boxIn) {
      this.slideBoxOut();
    } else {
      this.slideBoxIn();
    }
  }

  bearIsOffRamp(bear) {
    return (
      bear.body.position.y > this.bearRampThreshold.y ||
      bear.body.position.x > this.bearRampThreshold.x
    );
  }

  bearIsOutOfBounds(bear) {
    return (
      bear.body.position.x < 0 - this.config.stage.offStageMargin ||
      bear.body.position.x >
        this.config.stage.width + this.config.stage.offStageMargin ||
      bear.body.position.y >
        this.config.stage.height + this.config.stage.offStageMargin
    );
  }

  updateBoxPosition(time) {
    const { box } = this.worldObjects;
    const targetX = this.boxIn ? this.config.box.inX : this.config.box.outX;
    const speed = this.config.box.topSpeed * (time * 60);
    const diff = targetX - box.position.x;
    const { x, y } = box.position;
    if (Math.abs(diff) < speed) {
      this.boxMoving = false;
      this.boxSpeed = 0;
      Matter.Body.setPosition(box, { x: targetX, y }, false);
    } else {
      this.boxSpeed = diff > 0 ? speed : -speed;
      Matter.Body.setPosition(box, { x: x + this.boxSpeed, y }, false);
    }
  }

  triggerLeverPull(leverIndex) {
    this.levers[leverIndex - 1].handleAction();
  }

  showLeverText(leverIndex, text) {
    this.levers[leverIndex - 1].showText(text);
  }

  disableLevers() {
    this.levers.forEach((lever) => {
      lever.disable();
    });
  }

  enableLevers() {
    this.levers.forEach((lever) => {
      lever.enable();
    });
  }

  resetLevers() {
    this.levers.forEach((lever) => {
      lever.reset();
    });
  }

  showPullsLeft(pullsLeft) {
    this.pullsLeft.addClass('visible');
    this.pullsLeft.text(pullsLeft);
  }

  hidePullsLeft() {
    this.pullsLeft.removeClass('visible');
  }

  showNewGameSign() {
    this.$newGameSign.addClass('visible');
  }

  hideNewGameSign() {
    this.$newGameSign.removeClass('visible');
  }

  queueBearProcessing() {
    this.bearProcessingTimer = setTimeout(() => {
      this.handleAllBearsInBox();
    }, this.config.app.bearProcessingQueueTimeout);
    this.readyToProcessBears = true;
  }

  handleAllBearsInBox() {
    clearTimeout(this.bearProcessingTimer);
    this.readyToProcessBears = false;
    this.processBearBatch();
  }

  processBearBatch() {
    if (this.processingBears) {
      return;
    }
    this.processingBears = true;
    this.events.emit('bear-process-start');
    this.slideBoxOut();
    setTimeout(() => {
      this.clearAllBears();
      this.processingBears = false;
      this.events.emit('bear-process-done');
    }, this.config.app.boxDispatchDelay);
  }

  handleLeverPull(leverIndex) {
    this.events.emit('lever-pull', leverIndex);
  }

  hideDebugGui() {
    if (this.debugToolsShown) {
      MatterTools.Gui.destroy(this.debugGui);
      this.debugGui = null;

      MatterTools.Inspector.destroy(this.debugInspector);
      this.debugInspector = null;

      this.debugToolsShown = false;
      this.$element.removeClass('with-debug');
    }
  }

  toggleDebugGui() {
    if (this.debugToolsShown) {
      this.hideDebugGui();
    } else {
      this.showDebugGui();
    }
  }
}

module.exports = SummyBearsView;

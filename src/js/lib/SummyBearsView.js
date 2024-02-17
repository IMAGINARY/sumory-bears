/* globals Matter, MatterTools */

class SummyBearsView {
  constructor(config) {
    // todo: merge default config with passed config
    this.config = SummyBearsView.DefaultConfig;
    this.$element = $('<div class="summy-bears">');
    this.worldObjects = {};
    this.chutes = [];
    this.bears = [];
    this.boxMoving = false;
    this.boxIn = true;
    this.boxSpeed = 0;
    this.bearCount = 0;
    this.countThreshold = Number.Infinity;

    this.debugToolsShown = false;
    this.debugGui = null;
    this.debugInspector = null;

    this.engine = Matter.Engine.create();
    this.render = Matter.Render.create({
      element: this.$element[0],
      engine: this.engine,
      options: {
        width: this.config.stage.width,
        height: this.config.stage.height,
        wireframes: true,
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
    this.runner = Matter.Runner.create();
    Matter.Runner.run(this.runner, this.engine);
  }

  initWorld() {
    const Rectangle = Matter.Bodies.rectangle;

    this.worldObjects.ramp = Rectangle(650, 560, 2000, 60, {
      label: 'ramp',
      isStatic: true,
      angle: this.config.ramp.angle * ((Math.PI * 2) / 360),
      staticFriction: 0.5,
      friction: 0,
    });

    this.countThreshold = Math.ceil(this.worldObjects.ramp.bounds.max.y);

    const boxProps = {
      friction: 0.5,
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

    window.box = this.worldObjects.box;

    // this.worldObjects.platform = Matter.Bodies.rectangle(1920, 940, 640, 60, {
    //   label: 'platform',
    //   isStatic: true,
    //   friction: 0.1,
    // });

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
        this.config.chutes.height + yOffset,
        this.config.chutes.wallWidth
      );
    });

    Matter.Composite.add(this.engine.world, Object.values(this.worldObjects));

    window.toggleBox = this.toggleBox.bind(this);
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
   * @param {number} wallWidth
   *  The width of the walls of the chute. Walls are placed outside the width of the chute.
   */
  addChute(x, y, width, height, wallWidth) {
    const leftWall = Matter.Bodies.rectangle(
      x - width / 2 - wallWidth / 2,
      y - height / 2,
      wallWidth,
      height,
      {
        label: 'chuteL',
        isStatic: true,
      }
    );
    const rightWall = Matter.Bodies.rectangle(
      x + width / 2 + wallWidth / 2,
      y - height / 2,
      wallWidth,
      height,
      {
        label: 'chuteR',
        isStatic: true,
      }
    );

    this.chutes.push({
      x,
      y,
      height,
      leftWall,
      rightWall,
    });

    Matter.Composite.add(this.engine.world, [leftWall, rightWall]);
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
        }
      ),
      counted: false,
    };
    this.bears.push(newBear);
    return newBear;
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
    this.bears.forEach((bear) => {
      if (!bear.counted && bear.body.position.y > this.countThreshold) {
        bear.counted = true;
        this.bearCount += 1;
        console.log(`Bear count: ${this.bearCount}`);
      }

      if (this.bearIsOutOfBounds(bear)) {
        Matter.Composite.remove(this.engine.world, bear.body);
        removed.push(bear);
      }
    });
    if (removed.length) {
      this.bears = this.bears.filter((bear) => !removed.includes(bear));
    }
  }

  clearAllBears() {
    this.bears.forEach((bear) => {
      Matter.Composite.remove(this.engine.world, bear.body);
    });
    this.bears = [];
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
    // todo: make time independent
    // todo: time = 1/60 aprox.
    const { box } = this.worldObjects;
    const targetX = this.boxIn ? this.config.box.inX : this.config.box.outX;
    const speed = this.config.box.topSpeed;
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

SummyBearsView.DefaultConfig = {
  stage: {
    width: 1920,
    height: 1080,
    offStageMargin: 500,
  },
  ramp: {
    angle: 8,
  },
  box: {
    inX: 1740,
    outX: 2050,
    topSpeed: 6,
  },
  bears: {
    width: 12,
    height: 24,
    airFriction: 0.01,
    staticFriction: 0.5,
    friction: 0.000025,
    mass: 0.5,
    restitution: 0.4,
    slop: 0.2,
  },
  chutes: {
    count: 9,
    width: 60,
    height: 200, // min on-screen height
    wallWidth: 10,
    spacing: 170,
  },
};

module.exports = SummyBearsView;

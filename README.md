# Sumory Bears

Gummy-bear based variation of the Sumory exhibit.

The Sumory exhibit, part of the I AM AI exhibition, is a way to teach the concepts of 
exploration and exploitation.

## Building

Requires Node.js (v18.19 or greater) and npm.

To build the project, run:

```bash
npm install
npm run build
```

The built files will be in the `dist` directory, and can be served using any web server.

## Query strings

The `index.html` accepts the following query string parameters:

- `settings`: The name of a settings file to load. Defaults to `settings.yml`. It must reside in the
  root directory and have a name that only contains letters, numbers, - or _, and ends in `.yml`.

## Configuration

The configuration files are in the `config` directory.

You can override any of the configuration keys through a `settings.yml` file in the root directory.

The `app.config.json` file in the root directory contains build-time configuration settings.

## Developer mode commands

### Keyboard Shortcuts

- **d**: Show debug UI for the physics engine
- **1-9**: Spawn bears from a chute
- **b**: Toggle the box in and off the screen
- **x**: Clear all bears

## Credits

Developed by [Eric Londaits](https://github.com/elondaits) for 
[Imaginary gGmbH](http://about.imaginary.org).

Based on a concept by Aaron Montag and Andreas Matt.

Supported by the [Deutsches Museum Bonn](https://www.deutsches-museum.de/bonn/).

## License

This software is licensed under the MIT license. See LICENSE file for details.
Images and other assets are licensed under the Creative Commons Attribution-ShareAlike 4.0 
International License. See ASSETS_LICENSE file for details.

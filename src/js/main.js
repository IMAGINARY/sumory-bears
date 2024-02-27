require('../sass/default.scss');
const yaml = require('js-yaml');
const SummyBearsApp = require('./lib/SummyBearsApp');
const showFatalError = require('./lib/helpers-web/show-fatal-error');
const CfgLoader = require('./lib/loader/cfg-loader');
const CfgReaderFetch = require('./lib/loader/cfg-reader-fetch');
const { initSentry } = require('./lib/helpers/sentry');

(async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let settingsFilename = 'settings.yml';
    const settingsFileUnsafe = urlParams.get('settings');
    if (urlParams.get('settings')) {
      if (!urlParams.get('settings').match(/^[a-zA-Z0-9_-]+\.yml$/)) {
        console.warn(
          'Invalid settings file name. Ignoring. Use only alphanumeric characters, _ or -. and .yml extension.'
        );
      } else {
        settingsFilename = settingsFileUnsafe;
      }
    }

    const sentryDSN = urlParams.get('sentry-dsn') || process.env.SENTRY_DSN;
    if (sentryDSN) {
      initSentry(sentryDSN);
    }

    const cfgLoader = new CfgLoader(CfgReaderFetch, yaml.load);
    const config = await cfgLoader
      .load([
        'config/app.yml',
        'config/stage.yml',
        'config/game.yml',
        'config/matter-js.yml',
        'config/bodies.yml',
        'config/i18n.yml',
        settingsFilename,
      ])
      .catch((err) => {
        throw new Error(`Error loading configuration: ${err.message}`);
      });

    $('[data-component="SummyBears"]').each(function () {
      const app = new SummyBearsApp(config);
      this.replaceWith(app.getHtmlElement());
    });
  } catch (err) {
    showFatalError(err.message, err);
    console.error(err);
  }
})();

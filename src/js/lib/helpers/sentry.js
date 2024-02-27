const Sentry = require('@sentry/browser');
const CaptureConsoleIntegration = require('@sentry/integrations').CaptureConsole;

// eslint-disable-next-line import/prefer-default-export
function initSentry(sentryDSN) {
  Sentry.init({
    dsn: sentryDSN,
    transport: Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),
    transportOptions: {
    },
    release: process.env.GIT_COMMIT_HASH,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    integrations: [new CaptureConsoleIntegration({
      // array of methods that should be captured
      // defaults to ['log', 'info', 'warn', 'error', 'debug', 'assert']
      levels: ['error'],
    })],
  });
}

module.exports = { initSentry };

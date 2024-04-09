//
// We're using plain browser sentry and need to init in inline js
window.Sentry && Sentry.onLoad(() => {
  Sentry.init({
    dsn: `https://${
      document.currentScript.getAttribute("data-sentryKe")
    }@o464670.ingest.sentry.io/4506161671897088`,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({ maskAllText: false }),
    ],
    replaysSessionSampleRate: 1.0,
    tracesSampleRate: 1.0,
  });
});

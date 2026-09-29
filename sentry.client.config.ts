import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: 'https://5bc7a747166247ed91d54635ccff184b@rustrak-api.edideaur.works/42',
  tracesSampleRate: 1.0,
});

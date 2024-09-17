const i18next = require('i18next');
const Backend = require('i18next-node-fs-backend');

i18next
  .use(Backend)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json',
    },
    supportedLngs: ['en', 'es'],
    preload: ['en', 'es'],
  });
module.exports = i18next;

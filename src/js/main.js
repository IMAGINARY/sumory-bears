require('../sass/default.scss');
const SummyBearsApp = require('./lib/SummyBearsApp');

const config = {};
$('[data-component="SummyBears"]').each(function () {
  const app = new SummyBearsApp(config);
  this.replaceWith(app.getHtmlElement());
});

const corsAnywhere = require('cors-anywhere');

corsAnywhere.createServer({
  originWhitelist: ['http://localhost:9000'],
  requireHTTPS: false,
  // Outros options podem ser configurados aqui
}).listen(8081, () => {
  console.log('CORS Anywhere server running on http://localhost:8080');
});

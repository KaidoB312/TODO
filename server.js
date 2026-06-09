console.log('server starting');

var http = require('http');

var server = http.createServer(function (req, res) {
  res.writeHead(200);
  res.end('ok');
});

server.listen(process.env.PORT || 3000, function () {
  console.log('listening on ' + (process.env.PORT || 3000));
});

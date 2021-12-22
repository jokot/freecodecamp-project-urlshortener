require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

const savedUrls = [];

// Basic Configuration
const port = process.env.PORT || 3000;

const checkHost = (host) => {
  return new Promise((resolve, reject) => {
    dns.lookup(host, (err, address) => {
      if (err) {
        reject(err);
      } else {
        resolve(address);
      }
    });
  });
}

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^http?:\/\//, '');
  console.log(host);
  checkHost(host) 
    .then(address => {
      console.log(address);
      savedUrls.indexOf(url) === -1 ? savedUrls.push(url) : null;
      const index = savedUrls.indexOf(url);
      res.json({
        original_url: url,
        short_url: index
      });
    })
    .catch(err => {
      console.log(err);
      res.json({
        error: "Invalid Hostname"
      });
    });
});

app.get("/api/shorturl/:id", (req, res) => {
  const url = savedUrls[req.params.id];
  if (url) {
    res.redirect(url);
  } else {
    res.json({
      error: "No short url found for given input"
    });
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

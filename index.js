async function getIdFromLenght() {
  let id = 0;
  await UrlModel.countDocuments({}, (err, count) => {
    if (err) return console.log(err);

    return count;
  }).then((length) => {
    id = length;
  });

  return id;
}


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});
const UrlModel = new mongoose.model("url", urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/shorturl/:short_url", (req, res) => {
  console.log('short_url_param ' + req.params.short_url);
  if (req.params.short_url === 'undefined') return res.json({ error: 'invalid short_url' });

  UrlModel.findById(req.params.short_url, (err, urlObject) => {
    if (err) return;
    console.log(urlObject);

    res.redirect(urlObject.original_url);
  });
});

app.post('/api/shorturl', async function(req, res) {

  let url = req.body.url;
  if (!url.startsWith("https://") && !url.startsWith("http://")) return res.json({ error: 'invalid url' });

  let urlObject = new UrlModel({ original_url: url, short_url: 1 });
  urlObject.save((err) => {
    if (err) return console.log(err);

    // to pass freecodecamp tests
    res.json({ original_url: url, short_url: urlObject._id });
  
    //to be more friendly to user
    // res.send(`<a href="https://kennedfer-url-shortner.onrender.com/api/shorturl/${urlObject._id}">your link :)</a>`);
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

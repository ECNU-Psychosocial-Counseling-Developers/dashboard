const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const counselorRecord = require('./mock-data/counselor-record');

const jsonParser = bodyParser.json();
const app = express();

app.use(cors());

// ---------------- GET ----------------

app.get('/counselor-record', (req, res) => {
  const { pageSize = 20, pageNumber = 1, name, date } = req.query;
  res.send({
    data: counselorRecord.slice(0, pageSize),
    total: 100,
  });
});

// ---------------- POST ----------------

app.post('/', jsonParser, (req, res) => {
  console.log('post body:', req.body);
  res.send({ age: 20 });
});

app.listen(8080);

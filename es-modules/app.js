const fs = require('fs');

const express = require('express');
const handler = require('./handler');

const app = express();

app.get('/', handler);

app.listen(3000);

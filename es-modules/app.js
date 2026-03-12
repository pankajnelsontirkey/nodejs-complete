// const express = require('express');
import express from 'express';

// const handler = require('./handler');
// import handler from './handler.js';
import { handler } from './handler.js';

const app = express();

app.get('/', handler);

app.listen(3000);

import express from 'express';
import bodyParser from 'body-parser';
import viewEngine from './config/viewEngine';
import initWebRoutes from './route/web';
require('dotenv').config();

import connectDB from './config/connectDB';

let app = express();

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', process.env.URL_REACTJS);

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

viewEngine(app);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 6969;
app.listen(port, () => {
    console.log("app is runing on: " + port);
});
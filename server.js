'use strict'
const server = require('express')
const app = server();
const cors = require('cors');
const { request } = require('http');
const { response } = require('express');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
app.use(cors());
// routes
app.get('/', (request, response) => {
    response.status(200).send('This is the HomePage');
});




app.all('*', (request, response) => {
    response.status(404).send('Error 404 : page not found');
});
// app.listen
app.listen(PORT, () => {
    console.log('server is listening to the port: ', PORT);
});
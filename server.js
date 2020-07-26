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

app.get('/location', (request, response) => {
    //console.log('location request');
    //console.log(request.query.city);
const locationFile = require('./data/location.json');
const weatherFile = require('./data/weather.json');
let city = request.query.city;
let locationData = new Location(city, locationFile, weatherFile);
response.send(locationData);
});



app.all('*', (request, response) => {
    response.status(404).send('Error 404 : page not found');
});
// app.listen
app.listen(PORT, () => {
    console.log('server is listening to the port: ', PORT);
});

// global functions
function Location(city, locationFile, weatherFile){
    this.search_query = city;
    this.formatted_query = locationFile[0].display_name;
    this.latitude = locationFile[0].lat;
    this.longitude = locationFile[0].lon;
}
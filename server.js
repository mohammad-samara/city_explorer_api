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

// app.get('/location', render);

// let locationFile = require('./data/location.json');
// //const weatherFile = require('./data/weather.json');
// function render(request, response) {
//     let locationData = getLocation(request.query.city);
//     response.status(200).json(locationData);

// }
// function getLocation(city) {
//     let data = require('./data/location.json');
//     return new Location(city, locationFile);
// }

// app.all('*', (request, response) => {
//     response.status(404).send('Error 404 : page not found');
// });

//another solution
app.get('/location', (request, response) => {
    let locationFile = require('./data/location.json');
    let city = request.query.city;
    let locationData = new Location(city, locationFile);
    response.status(200).send(locationData);
    response.status(500).send(error500);
});

app.get('/weather', (request, response) => {
    let weatherFile = require('./data/weather.json');
    let locationWeather = weatherFile.data.map(weather)
    response.status(200).send(locationWeather);
    response.status(500).send(error500);
});

// end of another solution



// app.listen
app.listen(PORT, () => {
    console.log('server is listening to the port: ', PORT);
});

// global functions
function Location(city, locationFile) {
    this.search_query = city;
    this.formatted_query = locationFile[0].display_name;
    this.latitude = locationFile[0].lat;
    this.longitude = locationFile[0].lon;
};

/*
[
  {
    "forecast": "Partly cloudy until afternoon.",
    "time": "Mon Jan 01 2001"
  },
  {
    "forecast": "Mostly cloudy in the morning.",
    "time": "Tue Jan 02 2001"
  },
  ...
]
*/

function weather(weatherData) {
    //let weatherArr = [];
    function WeatherObject(forecast, time) {
        this.forecast = forecast;
        this.time = time;
        //weatherArr.push(this);
    };
    //for (let i = 0; i < weatherFile.data.length; i++) {
        let forecast = weatherData.weather.description;
        let time = weatherData.valid_date;
        let newObj = new WeatherObject(forecast, time);
        
   // };
    //weatherArr.push(weatherFile.data.length);
    return newObj;
};

let error500 = {
    status: 500,
    responseText: "Sorry, something went wrong"
  }
'use strict'
const server = require('express')
const app = server();
const cors = require('cors');
const { request } = require('http');
const { response } = require('express');
require('dotenv').config();
const superagent = require('superagent');
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

//another solution for static location from json file
// app.get('/location', (request, response) => {
//     let locationFile = require('./data/location.json');
//     let city = request.query.city;
//     let locationData = new Location(city, locationFile);
//     response.status(200).send(locationData);
//     response.status(500).send(error500);
// });
var city;
// dynamic location from API
app.get('/location', handleLocation);
function handleLocation(request, response){
    city = request.query.city;
 // let locationData = new Location(city, locationFile);
 getLocationData(city).then(returnedData => {
        response.status(200).send(returnedData);
    });
    
    //response.status(500).send(error500);
}
function getLocationData(city) {
    let GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
    let url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
    return superagent.get(url).then(data => {
        let locationData = new Location(city, data.body);
        //console.log(data);
        return locationData;
    });
}
     
// app.get('/weather', (request, response) => {
//     let weatherFile = require('./data/weather.json');
//     let locationWeather = weatherFile.data.map(weather);
//     response.status(200).send(locationWeather);
//     response.status(500).send(error500);
// });
// dynamic weather from API
// app.get('/weather', handleWeather);
// function handleWeather(request, response){

//     getWeatherData(city).then(returnedWeatherData => {
//         response.status(200).send(returnedWeatherData);
//     });
// }

app.get('/weather', handleWeather);
function handleWeather(request, response){

    getWeatherData(city).then(returnedWeatherData => {
        response.status(200).send(returnedWeatherData);
    });
}

function getWeatherData(city) {
    let WEATHER_API_KEY = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&days=8&key=${WEATHER_API_KEY}`;
    return superagent.get(url).then(CurrentWeatherData => {
        console.log(CurrentWeatherData.body);
        let locationWeather = CurrentWeatherData.body.data.map(weather); 
        return locationWeather;
    });
}
    
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
        //let time = weatherData.valid_date;
        let time = weatherData.ob_time;
        let newObj = new WeatherObject(forecast, time);
        
   // };
    //weatherArr.push(weatherFile.data.length);
    return newObj;
};

let error500 = {
    status: 500,
    responseText: "Sorry, something went wrong"
  }
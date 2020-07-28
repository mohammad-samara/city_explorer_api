'use strict'
const server = require('express')
const app = server();
const cors = require('cors');
const { request } = require('http');
const { response } = require('express');
require('dotenv').config();
const pg = require('pg');  // sql first step in intializing
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
app.use(cors());
// sql second step in intializing
const client = new pg.Client(process.env.DATABASE_URL);
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
var lat;
var lon;
var formatted_query;
// dynamic location from API
app.get('/location', handleLocation);
function handleLocation(request, response) {
    city = request.query.city;
    // let locationData = new Location(city, locationFile);
    getLocationData(city).then(returnedData => {
        formatted_query = returnedData;
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

// get location from database
app.get('/cashed', (request, response) => {
    let SQL = 'SELECT * FROM locations';
    client.query(SQL).then((result) => {
        response.status(200).send(result.rows);
    });
});
// cash(save) location data to the database
app.get('/add', (request, response) => {
    let search_query = city;
    let formatted_query = formatted_query;  // if there is a request it will be request.query.<the rquest query name in the url>
    let latitude = lat;
    let longitude = lon;
    let SQL = "INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4)";
    let values = [search_query, formatted_query, latitude, longitude];
    client.query(SQL, values).then(() => {
        response.status(200).send('new location is cashed');
    });


});

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
function handleWeather(request, response) {

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


// /trail
app.get('/trails', handleTrails);
function handleTrails(request, response) {

    getTrailsData(city).then(returnedTrailsData => {
        response.status(200).send(returnedTrailsData);
    });
}

function getTrailsData(city) {
    let TRAIL_API_KEY = process.env.TRAIL_API_KEY;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${TRAIL_API_KEY}`;
    return superagent.get(url).then(CurrentTrailsData => {
        console.log(CurrentTrailsData.body);
        let locationTrails = CurrentTrailsData.body.trails.map(trails);
        return locationTrails;
    });
}

// end of another solution


client.connect(() => {           // this is a promise and we need to start the server after it connects to the database
    // app.listen
    app.listen(PORT, () => {          // to Start the express server only after the database connection is established.
        console.log('server is listening to the port: ', PORT);
    });
});


// global functions
function Location(city, locationFile) {
    this.search_query = city;
    this.formatted_query = locationFile[0].display_name;
    this.latitude = locationFile[0].lat;
    this.longitude = locationFile[0].lon;
    lat = locationFile[0].lat;
    lon = locationFile[0].lon;
};



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

/*
{
    "name": "Rattlesnake Ledge",
    "location": "Riverbend, Washington",
    "length": "4.3",
    "stars": "4.4",
    "star_votes": "84",
    "summary": "An extremely popular out-and-back hike to the viewpoint on Rattlesnake Ledge.",
    "trail_url": "https://www.hikingproject.com/trail/7021679/rattlesnake-ledge",
    "conditions": "Dry: The trail is clearly marked and well maintained.",
    "condition_date": "2018-07-21",
    "condition_time": "0:00:00 "
  }
*/
function trails(trailData) {
    //let weatherArr = [];
    function TrailObject(name, location, length, stars, star_votes, summary, trail_url, conditions, condition_date, condition_time) {
        this.name = name;
        this.location = location;
        this.length = length;
        this.stars = stars;
        this.star_votes = star_votes;
        this.summary = summary;
        this.trail_url = trail_url;
        this.conditions = conditions;
        this.condition_date = condition_date;
        this.condition_time = condition_time;
    };
    let name = trailData.name;
    let location = trailData.location;
    let length = trailData.length;
    let stars = trailData.stars;
    let star_votes = trailData.star_votes;
    let summary = trailData.summary;
    let trail_url = trailData.url;
    let conditions = trailData.conditionDetails;
    let condition_date = trailData.conditionDate.split(" ")[0];
    let condition_time = trailData.conditionDate.split(" ")[1];

    let newObj = new TrailObject(name, location, length, stars, star_votes, summary, trail_url, conditions, condition_date, condition_time);

    return newObj;
};

let error500 = {
    status: 500,
    responseText: "Sorry, something went wrong"
}
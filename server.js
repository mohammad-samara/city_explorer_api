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
var city = "nochoose";
var lat;
var lon;
var formatted_query_location;
// dynamic location from API
app.get('/location', handleLocation);
function handleLocation(request, response) {
   let city = request.query.city;
    //let SQL = 'SELECT * FROM locations';
    let cashedLocation = `SELECT * FROM locations WHERE search_query = '${city}'`;
    client.query(cashedLocation).then((result) => {
        //console.log(result.rows.length);
        if(result.rows.length>0){
        console.log("loaded from data base");
        let modifiedResult = {
            "search_query": `${result.rows[0].search_query}`,
            "formatted_query": `${result.rows[0].formatted_query}`,
            "latitude": `${result.rows[0].latitude}`,
            "longitude": `${result.rows[0].longitude}`
        }
        response.status(200).send(modifiedResult);
    }else{
        getLocationData(city).then(returnedData => {
            let search_query = city;
            let formatted_query = formatted_query_location;  // if there is a request it will be request.query.<the rquest query name in the url>
            let latitude = lat;
            let longitude = lon;
            let SQL = "INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4)";
            let values = [search_query, formatted_query, latitude, longitude];
            client.query(SQL, values).then(() => {
                response.status(200).send(returnedData);
            });
            //response.status(200).send(returnedData);

        });
    }
    })/*.catch(() => {
        getLocationData(city).then(returnedData => {
            let search_query = city;
            let formatted_query = formatted_query_location;  // if there is a request it will be request.query.<the rquest query name in the url>
            let latitude = lat;
            let longitude = lon;
            let SQL = "INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4)";
            let values = [search_query, formatted_query, latitude, longitude];
            client.query(SQL, values).then(() => {
                response.status(200).send(returnedData);
            });
            //response.status(200).send(returnedData);

        });
    })*/




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
        let modifiedResult = {
            "search_query": `${result.rows[0].search_query}`,
            "formatted_query": `${result.rows[0].formatted_query}`,
            "latitude": `${result.rows[0].latitude}`,
            "longitude": `${result.rows[0].longitude}`
            
        }
        response.status(200).send(modifiedResult);
    });
});
// cash(save) location data to the database
app.get('/add', (request, response) => {
    let search_query =request.query.search_query;
    let formatted_query = formatted_query_location;  // if there is a request it will be request.query.<the rquest query name in the url>
    let latitude = request.query.latitude;
    let longitude = request.query.longitude;
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
let city = request.query.search_query;
console.log(`city in weather1111 is ${city}`);
    getWeatherData(city).then(returnedWeatherData => {
        response.status(200).send(returnedWeatherData);
    });
}

function getWeatherData(city) {
    console.log(`city in weather is ${city}`);
    let WEATHER_API_KEY = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&days=8&key=${WEATHER_API_KEY}`;
    return superagent.get(url).then(CurrentWeatherData => {
        //console.log(CurrentWeatherData.body);
        let locationWeather = CurrentWeatherData.body.data.map(weather);
        return locationWeather;
    });
}


// /trail
app.get('/trails', handleTrails);
function handleTrails(request, response) {

    getTrailsData(request).then(returnedTrailsData => {
        response.status(200).send(returnedTrailsData);
    });
}

function getTrailsData(request) {
    let lat = request.query.latitude;
    let lon = request.query.longitude;
    let TRAIL_API_KEY = process.env.TRAIL_API_KEY;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${TRAIL_API_KEY}`;
    return superagent.get(url).then(CurrentTrailsData => {
       // console.log(CurrentTrailsData.body);
        let locationTrails = CurrentTrailsData.body.trails.map(trails);
        return locationTrails;
    });
}

// /movies
app.get('/movies', handleMovies);
function handleMovies(request, response) {
    let queryCity = request.query.search_query;
    getMoviesData(queryCity).then(returnedMoviesData => {
        response.status(200).send(returnedMoviesData);
    });
}

function getMoviesData(city) {
    
   let MOVIE_API_KEY = process.env.MOVIE_API_KEY;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&query=${city}&language=en-US`;
    return superagent.get(url).then(CurrentMoviesData => {
        console.log(CurrentMoviesData.body.results[0].title);
        let locationMovies = CurrentMoviesData.body.results.map(movies);
        return locationMovies;
    });
}

// /yelp -- restaurants
app.get('/yelp', handleYelp);
function handleYelp(request, response) {
    let queryCity = request.query.search_query;
    getYelpData(request).then(returnedYelpData => {
        response.status(200).send(returnedYelpData);
    });
}

function getYelpData(request) {
     let lat = request.query.latitude;
     let lon = request.query.longitude;
     let page = request.query.page;
     let limit = 5;
     let offset = (page - 1) * 5;
    let queryParams= {
        "latitude" : request.query.latitude,
        "longitude" : request.query.longitude,
        "limit" : 5,
        "offset" : offset
    };
   let MOVIE_API_KEY = process.env.YELP_API_KEY;
   console.log(queryParams);
     //let url = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}&limit=${limit}&offset=${offset}`;
    let url = `https://api.yelp.com/v3/businesses/search`;
    return superagent.get(url).query(queryParams).set({ "Authorization": `Bearer ${MOVIE_API_KEY}`}).then(CurrentYelpData => {
        //console.log(CurrentYelpData.body.results[0].title);
        let locationYelp = CurrentYelpData.body.businesses.map(yelp);
        return locationYelp;
    });
}


// test yelp response output in separate route // this route only for testing yelp data
app.get('/testyelp', (request, response) => {
    //let queryCity = request.query.search_query;
    let queryCity = "seatlle";
    let MOVIE_API_KEY = process.env.YELP_API_KEY;
    let url = `https://api.yelp.com/v3/businesses/search?latitude=47.6038321&longitude=-122.3300624`;
    superagent.get(url).set({ "Authorization": `Bearer ${MOVIE_API_KEY}`}).then(CurrentYelpData => {
       // console.log(CurrentYelpData.body);
       response.status(200).send(CurrentYelpData.body);
    });
    });

// end of another solution


client.connect().then(() => {           // this is a promise and we need to start the server after it connects to the database
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
    formatted_query_location = locationFile[0].display_name;
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
    let time = weatherData.valid_date;
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

function movies(moviesData) {
    //let weatherArr = [];
    function MovieObject(title, overview, average_votes, total_votes, image_url, popularity, released_on) {
        this.title = title;
        this.overview = overview;
        this.average_votes = average_votes;
        this.total_votes = total_votes;
        this.image_url = image_url;
        this.popularity = popularity;
        this.released_on = released_on;
    };
    let title = moviesData.title;
    let overview = moviesData.overview;
    let average_votes = moviesData.vote_average;
    let total_votes = moviesData.vote_count;
    let image_url = `https://image.tmdb.org/t/p/w500${moviesData.poster_path}`;
    let popularity = moviesData.popularity;
    let released_on = moviesData.release_date;

    let newObj = new MovieObject(title, overview, average_votes, total_votes, image_url, popularity, released_on);

    return newObj;
};
// edit for yelp
function yelp(yelpData) {
    //let weatherArr = [];
    function MovieObject(name, image_url, price, rating, url) {
        this.name = name;
        this.image_url = image_url;
        this.price = price;
        this.rating = rating;
        this.url = url;
    };
    let name = yelpData.name;
    let image_url = yelpData.image_url;
    let price = yelpData.price;
    let rating = yelpData.rating;
    let url = yelpData.url;

    let newObj = new MovieObject(name, image_url, price, rating, url);

    return newObj;
};

let error500 = {
    status: 500,
    responseText: "Sorry, something went wrong"
}
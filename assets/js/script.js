//Display the current date and time
var timeDisplayed = moment().format('dddd, MMMM Do YYYY, h:mm:ss a');
//console.log(timeDisplayed);

// call currentTime every second (1000)
setInterval(currentTime, 1000);

// current time format
function currentTime() {
    // set the current time format
    timeDisplayed = moment().format('dddd, MMMM Do YYYY, h:mm:ss a');
    // Empty the current day element
    $('#currentDay').empty();
    // Display the current time
    $('#currentDay').text(timeDisplayed);
}

// invoke the function to eliminate a 1s gap when the page loads
currentTime();


// Access toggle switch HTML element
var themeSwitcher = document.querySelector("#theme-switcher");
var container = document.querySelector(".container");

// Set default mode to Celsius (Metric)
var mode = "Celsius";

// Listen for a click event on toggle switch
themeSwitcher.addEventListener("click", function() {
// need to add logic for converting all calculations from metric to imperial 
});

// https://stackoverflow.com/questions/38237673/how-to-hide-an-api-key-in-client-side-javascript
// open weather API Key
const APIKey = "8bb35f7b4169a5a8d55d28abdec74bb0";
const cities = [];

// Here we are building the URL we need to query the One call weather API to retrieve the UV Index.  
//This API requires Geographical coordinates that we get from the 5 day API so we can retirive the 
//UV Index for the current day and the next 5 days and store them in the uvInxex array
function getWeatherData(lat, lon, city) {

    var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=,minutely,hourly,alerts&appid=" + APIKey;

    // Here we run our AJAX call to the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        // We store all of the retrieved data inside of an object called "response"
        .then(function (response) {

            // console.log(response);

            showWeatherData(response, city);

        });           
 };


 //call the weather API based on ZipCode and call the fucntion showWeatherData to load the values
function loadWeatherZip(zipCpde, isClicked) {

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?zip=" + zipCpde + ",us&appid=" + APIKey;
    var weatherContainer = $("#weatherContainer");

    // Here we run our AJAX call to the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        // We store all of the retrieved data inside of an object called "response"
        .then(function (response) { 

            console.log(response);

            if (!isClicked)
            {
                saveCities(response);  //save the city and zip to local storage
                renderCities();
            }


            //load weather
            getWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function (response){
            alert("Not a vaild Zip Code")
        });
}

function loadWeatherCity(city, isClicked) {
    
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",us&appid=" + APIKey;
    var weatherContainer = $("#weatherContainer");

    // Here we run our AJAX call to the OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        // We store all of the retrieved data inside of an object called "response"
        .then(function (response) {

            console.log(response);

            if (!isClicked)
            {
                saveCities(response);  //save the city and zip to local storage
                renderCities();
            }

            //load weather
            getWeatherData(response.city.coord.lat, response.city.coord.lon, response.city.name);

        }).catch(function(response){
            alert("Not a valid City");
        });
}

function showWeatherData(weatherData, city)
{
    //load current
    var iconURL = "http://openweathermap.org/img/w/" + weatherData.current.weather[0].icon + ".png";  //get weather icon
    $("#cityDate").html(city + " (" + new Date().toLocaleDateString() + ") <img id=\"icon\" src=\"" + iconURL  + "\" alt=\"Weather icon\"/>");

    var temp = parseInt(weatherData.current.temp);
    temp = Math.round(((temp-273.15)*1.8) + 32);
    $("#currentTemp").html(" " + temp +  "  &degF");
    $("#currentHumidity").html(weatherData.current.humidity + "%");
    $("#currentWindSpeed").html(weatherData.current.wind_speed + " MPH");

    //get the current uv index and store in the uvIndex.current array 
    var uvIndex = weatherData.current.uvi;

    var bgColor = "";  //holds the background color for UV Index
    var textColor = "";  //holds the text color for UV Index

    if (uvIndex < 3) //if uv index is low (1-2)
    {
        bgColor = "bg-success";
        textColor = "text-light";  
    }
    else if (uvIndex > 2 && uvIndex < 6)  //if uv index is mocerate (3-5)
    {
        bgColor = "bg-warning";
        textColor = "text-dark";             
    }
    else  //if uv index is high (6+)
    {
        bgColor = "bg-danger";
        textColor = "text-light";            
    }

    $("#currentUVIndex").html(uvIndex).addClass(bgColor + " p-1 " +  textColor); //set the UVIndex and color to the html


    //load 5 Day
    var ul5 = $("#fiveDay");
    ul5.empty();

    for (i=1; i < 6; i++)  //we want the days 1-5
    {
        //make the elements to display the 5 day forecast and append to the parent div
        var div = $("<div>").addClass("bg-primary");

        var dateTime = parseInt(weatherData.daily[i].dt); 
        var dateHeading = $("<h6>").text(new Date(dateTime * 1000).toLocaleDateString());  //convert unix time to javascript date
        var iconDayURL = "http://openweathermap.org/img/w/" + weatherData.daily[i].weather[0].icon + ".png";  //get weather icon
        var icon = $("<img>").attr("src", iconDayURL);

        temp = parseInt(weatherData.daily[i].temp.day);  //convert kelvin to Fahrenheit
        temp = Math.round(((temp-273.15)*1.8) + 32);  //convert kelvin to Fahrenheit
        var temp5 = $("<p>").html("Temp: " + temp +  "  &degF");

        var humidity5 = $("<p>").html("Humidity: " + weatherData.daily[i].humidity + "%");

        div.append(dateHeading);
        div.append(icon);
        div.append(temp5);
        div.append(humidity5);
        ul5.append(div);

    }

    $("#weatherData").show();
}

//load locations from local storage to the locations array
function loadCities()
{
    var CitiesArray = localStorage.getItem("cities");
    if (CitiesArray) //if not undefined
    {
      cities = JSON.parse(CitiesArray);  //make sure there is a locations object in local storage
      renderCities();
    }
    else {
      localStorage.setItem("cities", JSON.stringify(cities));  //if not make one and store it to local storage
    }
}

function renderCities()
{
    var divCities = $("#cityHistory");
    divCities.empty();  //clear the cities list before rendering it from the local storage object

    $.each(cities, function(index, item){
        var a = $("<a>").addClass("list-group-item list-group-item-action city").attr("data-city", cities[index]).text(cities[index]);
        divCities.append(a);
    });

    $("#cityHistory > a").off();

    $("#cityHistory > a").click(function (event)
    {   
        var element = event.target;
        var city = $(element).attr("data-city");

        loadWeatherCity(city, true);
    });

}

//save locations to the locations array and local storage
function saveCities(data)
{

    var city = data.city.name; //get the city came

    cities.unshift(city);
    localStorage.setItem("cities", JSON.stringify(cities));  //convert to a string and sent to local storage

}

$(document).ready(function () {

    $("#weatherData").hide();  //Hide the div that will show all the weather data and we will show it once it is populated

    loadCities();  //get the locations from local storage and load them to the Cities array

    $("#searchBtn").click(function (event) {  //event handler for the city search input
        var element = event.target; //set element to the div that was clicked
        var searchCriteria = $("#zipCode").val();  //get the user input
        
        if (searchCriteria !== "")  //make sure it is not empty
        {
            var zip = parseInt(searchCriteria); //is it a zip code or city name

            if (!isNaN(zip)) //yes it is a zip code
            {
                loadWeatherZip(zip, false);
            }
            else
            {
                loadWeatherCity(searchCriteria, false);  //no, it is a city name
            }
        }
    });
});

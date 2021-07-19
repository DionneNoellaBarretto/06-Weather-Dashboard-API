/* 
a) humidity logic always highlights in red
b) metric to imperial conversion logic 
c) the center box border needs to be squished to fit text width
d) for history add a count to the history of list group
e) width of the slider for imperial vs metric
f) past 5 days (historical data)
*/


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


// Access toggle switch HTML element: for imperial to metric measurement conversion: https://openweathermap.org/api/one-call-api#data
var themeSwitcher = document.querySelector("#theme-switcher");
var container = document.querySelector(".container");

// Set default mode to Celsius (Metric)
var mode = "Celsius";

// Listen for a click event on toggle switch
themeSwitcher.addEventListener("click", function() {
// need to add logic for converting all calculations from metric to imperial 
if (mode === "imperial") {
   // call the api.openweathermap.org/data/2.5/onecall?lat=30.489772&lon=-99.771335&units=imperial
  }
  else {
   // call the api.openweathermap.org/data/2.5/onecall?lat=30.489772&lon=-99.771335&units=metric
  }
});


// https://stackoverflow.com/questions/38237673/how-to-hide-an-api-key-in-client-side-javascript
// open weather API Key
const APIKey = "8bb35f7b4169a5a8d55d28abdec74bb0";
/* I could limit the api to just usa or a specific country by tweaking the queries as: us&appid= or uk&appid= in the end as seen below
"https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",us&appid=" + APIKey; */

let cities = [];

//logic for when user enters city name
function loadWeatherCity(city, isClicked) {
  //api call structured for when user inputs city name and hits enter
  var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",&appid=" + APIKey;
  // calling OpenWeatherMap API
  $.ajax({
      url: queryURL,
      method: "GET"
  })
  // Storing all of the retrieved data inside the same getWDresponse object
  .then(function (getWDresponse) {
    // console.log(getWDresponse);
          if (!isClicked)
          {
              saveLocations(getWDresponse);  //save the city and zip to local storage
              renderLocations();
          }

          //loads weather for the lat /lon/city name
          getWeatherData(getWDresponse.city.coord.lat, getWDresponse.city.coord.lon, getWDresponse.city.name);

      }).catch(function(getWDresponse){
        alert("Invalid!! You have not entered a valid city. Please click OK and supply a correct city name for that location's weather to be displayed")
      });
}

 //for Zip Code logic 
 function loadWeatherZip(zipCode, isClicked) {
  // calling the same api but using zip code parameter
      var queryURL = "https://api.openweathermap.org/data/2.5/forecast?zip=" + zipCode + ",&appid=" + APIKey;
  
      // calling OpenWeatherMap API
          $.ajax({
          url: queryURL,
          method: "GET"
      })
      // Storing all of the retrieved data inside the same getWDresponse object
          .then(function (getWDresponse) { 
              //console.log(getWDresponse);
              if (!isClicked)
              {
                  saveLocations(getWDresponse);  //save the city and zip to local storage
                  renderLocations();
              }
              //loads weather for the lat /lon/city name
              getWeatherData(getWDresponse.city.coord.lat, getWDresponse.city.coord.lon, getWDresponse.city.name);
  // The catch() method returns a Promise and deals with rejected cases only https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch 
          }).catch(function (getWDresponse){
              alert("Invalid!! You have not entered a valid Zip Code. Please click OK and supply a correct zip code for that location's weather to be displayed")
          });
  }

// the queryURL retrieves the UV Index based on geo coordinates received the 5 day API
function getWeatherData(lat, lon, city) {
  var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=,minutely,hourly,alerts&appid=" + APIKey;
    // calling OpenWeatherMap API
    $.ajax({
        url: queryURL,
        method: "GET"
    })
        // Storing all of the retrieved data inside of getWDresponse object
        .then(function (getWDresponse) {
            // console.log(getWDresponse);
            showWeatherData(getWDresponse, city);
        });           
 };


function renderLocations()
{
    var divLocations = $("#cityHistory");
    divLocations.empty();  //clear the cities list before rendering it from the local storage object

    $.each(cities, function(index, item){
        var a = $("<a>").addClass("list-group-item list-group-item-action city col-2 align-items-center align-self-center").attr("data-city", cities[index]).text(cities[index]);
        divLocations.append(a);
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
function saveLocations(data)
{

    var city = data.city.name; //get the city came

    cities.unshift(city);
    //convert to a string and save to local storage
    localStorage.setItem("cities", JSON.stringify(cities));  

}

//load locations from local storage to the locations array
function loadLocations()
{
    var locationsArray = localStorage.getItem("cities");
    if (locationsArray) //if not undefined
    { //make sure there is a cities object in local storage
      locations = JSON.parse(locationsArray); 
      renderLocations();
    }
    else {
        //if not make one and store it to local storage
      localStorage.setItem("cities", JSON.stringify(cities));  
    }
}

    //load current weather information F
    function showWeatherData(weatherData, city)
    {
      //current day weather icon variable
        var iconURL = "http://openweathermap.org/img/w/" + weatherData.current.weather[0].icon + ".png";  
        // adds a date after the city name is displayed followed by the current weather representative icon stored in the var defined above
        $("#cityDate").html(city + " (" + new Date().toLocaleDateString() + ") <img id=\"icon\" src=\"" + iconURL  + "\" alt=\"Weather icon\"/>");
    //current day temp,humidity and windspeed
        var temp = parseInt(weatherData.current.temp);
        // fahrenheit calculations
        temp = Math.round(((temp-273.15)*1.8) + 32);
        $("#Temperature").html(" " + temp +  "  &degF");
        
        //current humidity level indicator s per https://www.airthings.com/resources/everything-you-need-to-know-about-humidity
        var humidityPercentage = weatherData.current.humidity;
        //console.log(humidityPercentage);
        var alertColor = "";  //alert color for humidity ( https://getbootstrap.com/docs/4.0/components/alerts/)
        var textColor = "";  //text color for for humidity
            // for readings >=30 and less than 60 (green)
        if (humidityPercentage >=30 && humidityPercentage < 60) {
            alertColor = "alert-success";
            textColor = "text-dark";            
        } 
          // moderate or fair humidity levels (yellow)
        else if (humidityPercentage >=60 && humidityPercentage <70){
            alertColor= "alert-warning";
          textColor = "text-dark"; 
        } 
      //poor humidity reading (too low or too high) (red)
            else if ((humidityPercentage < 25) || (humidityPercentage >=70)){ 
                alertColor = "alert-danger";
              textColor = "text-dark";           
              }
    
     // concatenate humidity text and color indicator
     $("#Humidity").html(humidityPercentage).addClass(alertColor + " p-1 " +  textColor);      // $("#Humidity").html(weatherData.current.humidity + "%");
        $("#WindSpeed").html(weatherData.current.wind_speed + " MPH"); //MPH --> miles per hour
    
        //current uv index  
        var uvIndex = weatherData.current.uvi;
        var bgColor = "";  //background color for UV Index
        var textColor = "";  //text color for UV Index
    
        //highlight color coding uv index color using bg-status colors in bootstrap https://getbootstrap.com/docs/4.0/utilities/colors/#background-color
    
        //low uv index reading
        if (uvIndex < 3) 
        {
            bgColor = "bg-success";
            textColor = "text-light";  
        }
        // moderate uv index reading
        else if (uvIndex > 2 && uvIndex < 6)
        {
            bgColor = "bg-warning";
            textColor = "text-dark";             
        }
        //extremely high uv index reading
        else
        {
            bgColor = "bg-danger";
            textColor = "text-light";            
        }
      // concatenate uv index text and color indicator
      $("#UVIndex").html(uvIndex).addClass(bgColor + " p-1 " +  textColor); 
    
        // 5day forecast calls
        var fiveDayForecast = $("#fiveDay");
        // initially the 5 day forecast is empty 
        fiveDayForecast.empty();
    /* iteration for number of days weather data to display
    could also have done this: api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt={cnt}&appid={API key} where cnt is the number of days (1-16) for which an api response will be returned like for 10 days: api.openweathermap.org/data/2.5/forecast/daily?lat=35&lon=139&cnt=10&appid={API key}. For more information review https://openweathermap.org/forecast16#name16 OR
    used this : https://openweathermap.org/forecast5
    */
        for (i=1; i <= 5; i++)  
        {
            //make the elements to display the 5 day forecast and append to the parent div with an bg-info color as per bootstrap
            var div = $("<div>").addClass("bg-info text-center");
            var date = parseInt(weatherData.daily[i].dt); 
            //console.log(date);
             //convert unix time to javascript date
            var dateDisplay = $("<h5>").text(new Date(date * 1000).toLocaleDateString()); 
            //console.log(dateDisplay);
            //calling to retrieve corresponding weather icon for the forecasted weather for i # of days 
            var iconDayURL = "http://openweathermap.org/img/w/" + weatherData.daily[i].weather[0].icon + ".png";  //get weather icon
            // displaying the icon by referencing it from source url
            var icon = $("<img>").attr("src", iconDayURL);
                    //pull temp based on the i'th day
            temp = parseInt(weatherData.daily[i].temp.day);  
    //convert kelvin to Fahrenheit
            temp = Math.round(((temp-273.15)*1.8) + 32);  
            // concatenate temperature reading
            var temp5 = $("<p>").html("Temp: " + temp +  "  &degF");
            // concatenate wind speed reading https://openweathermap.org/api/one-call-api 
            var windspeed5 = $("<p>").html("Wind Speed: " + weatherData.daily[i].wind_speed + " miles/hour");
            // concatenate humidity reading 
            var humidity5 = $("<p>").html("Humidity: " + weatherData.daily[i].humidity + " %");
    // append and display it in the tile all together
            div.append(dateDisplay);
            div.append(icon);
            div.append(temp5);
            div.append(humidity5);
            div.append(windspeed5);
            fiveDayForecast.append(div);
        }
        $("#weatherData").show();
    }

// checking function
$(document).ready(function () {
//default hidden div that will display all the weather data and we will appear once populated
    $("#weatherData").hide();  
//get the cities  from local storage and load them to the cities array
    loadLocations();  
//event handler for the city search input
    $("#searchBtn").click(function (event) {  
        var element = event.target; //set element to the div that was clicked
        var searchCriteria = $("#zipCode").val();  //get user input
    //check to make sure it is not empty
        if (searchCriteria !== "")  
        { //check to ensure its a zip code or city name
            var zip = parseInt(searchCriteria); 
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
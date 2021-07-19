/* 
a) humidity logic always highlights in red
b) metric to imperial conversion logic 
c) the center box border needs to be squished to fit text width
d) for history add a count to the history of list group
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
/* I could limit the api to just usa or a specific country by tweaking the queries as: us&appid= or uk&appid= in the end as seen below
"https://api.openweathermap.org/data/2.5/forecast?q=" + city + ",us&appid=" + APIKey; */

let locations = [];

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
        alert("Invalid!! You have not entered a vaild city. Please click OK and supply a correct city name for that location's weather to be displayed")
      });
}

 //for Zip Code logic 
 function loadWeatherZip(zipCode, isClicked) {
  // calling the same api but using zipcode parameter
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

    $.each(locations, function(index, item){
        var a = $("<a>").addClass("list-group-item list-group-item-action city").attr("data-city", locations[index]).text(locations[index]);
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

    locations.unshift(city);
    localStorage.setItem("locations", JSON.stringify(locations));  //convert to a string and sent to local storage

}

//load locations from local storage to the locations array
function loadLocations()
{
    var locationsArray = localStorage.getItem("locations");
    if (locationsArray) //if not undefined
    {
      locations = JSON.parse(locationsArray);  //make sure there is a locations object in local storage
      renderLocations();
    }
    else {
      localStorage.setItem("locations", JSON.stringify(locations));  //if not make one and store it to local storage
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
        var bgColor = "";  //background color for humidity
        var textColor = "";  //text color for for humidity
            // for readings >=30 and less than 60 (green)
        if (humidityPercentage >=30 && humidityPercentage < 60) {
            bgColor = "bg-success";
            textColor = "text-light";            
        } 
          // moderate or fair humidity levels (yellow)
        else if (humidityPercentage >=60 && humidityPercentage <70){
          bgColor = "bg-warning";
          textColor = "text-dark"; 
        } 
      //poor humidity reading (too low or too high) (red)
            else if ((humidityPercentage < 25) || (humidityPercentage >=70)){ 
              bgColor = "bg-danger";
              textColor = "text-light";           
              }
    
     // concatenate humidity text and color indicator
     $("#Humidity").html(humidityPercentage).addClass(bgColor + " p-1 " +  textColor);      // $("#Humidity").html(weatherData.current.humidity + "%");
        $("#WindSpeed").html(weatherData.current.wind_speed + " MPH");
    
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
    could also have done this: api.openweathermap.org/data/2.5/forecast/daily?lat={lat}&lon={lon}&cnt={cnt}&appid={API key} where cnt is the number of days (1-16) for which an api response will be returned like for 10 days: api.openweathermap.org/data/2.5/forecast/daily?lat=35&lon=139&cnt=10&appid={API key}. For more information review https://openweathermap.org/forecast16#name16 
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
            // concatenate humidity reading 
            var humidity5 = $("<p>").html("Humidity: " + weatherData.daily[i].humidity + "%");
    // append and display it in the tile all together
            div.append(dateDisplay);
            div.append(icon);
            div.append(temp5);
            div.append(humidity5);
            fiveDayForecast.append(div);
        }
        $("#weatherData").show();
    }


$(document).ready(function () {

    $("#weatherData").hide();  //Hide the div that will show all the weather data and we will show it once it is populated

    loadLocations();  //get the locations from local storage and load them to the locations array

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
var restaurantID = document.getElementById('restaurants');
//var restaurantDetails = document.getElementById('RestaurantDetails');

var requestULR = 'https://raw.githubusercontent.com/Akita85/avisRestaurant/master/json/restaurant.json';
var request = new XMLHttpRequest();
request.open('GET', requestULR);
request.responseType = 'json';
request.send();

request.onload = function() 
{
  var restaurants = request.response;
  listRestaurantsHTML(restaurants);
  addNewMarker(restaurants);
  restaurantID.addEventListener('click', function(e)
    {
      infoRestaurants(restaurants);          
    });  
}

function calculateAverageRatingRestaurant(restaurant)
{
 var totalRating = 0;
 var averageRating = 0;

 restaurant.ratings.forEach(function (ratings)
 {
  totalRating += ratings.stars;
 });

 if (restaurant.ratings.length === 0)
 {
  averageRating = 0;
 } else {
  averageRating = totalRating/restaurant.ratings.length;
 }
 var roundedAverageRating = Math.round(averageRating*10)/10;
  return roundedAverageRating;
}

function listRestaurantsHTML(jsonObj) 
{
  var restos = jsonObj['restaurants'];
  
  restos.forEach((restaurant)=> {
    var totalStars = 5;
    var averRatingToShow = calculateAverageRatingRestaurant(restaurant);
    var starPercentage = Math.round((averRatingToShow/totalStars)*100);
    var myArticle = document.createElement('article');
    var myH5 = document.createElement('h5');
    var myPara2 = document.createElement('p');
    var myPara1 = document.createElement('p');

    var divStarsOuter = document.createElement('div');
    divStarsOuter.className = 'stars-outer';
    var divStarsInner = document.createElement('div');
    divStarsInner.className = 'stars-inner';
    divStarsInner.style.width = `${starPercentage}%`;

    myH5.textContent = restaurant.restaurantName;
    myPara2.textContent = averRatingToShow + '  ';
    myPara1.textContent = 'Adresse: ' + restaurant.address;
    

    myPara2.appendChild(divStarsOuter);
    divStarsOuter.appendChild(divStarsInner);
    myArticle.appendChild(myH5);
    myArticle.appendChild(myPara2);
    myArticle.appendChild(myPara1);
    restaurantID.appendChild(myArticle);  
    
  })

}

function infoRestaurants(jsonObj) 
{
  var restos = jsonObj['restaurants'];
  document.getElementById("myModalLabel").innerHTML = ""; 
  document.getElementById("myModalBody").innerHTML = "";
  
  restos.forEach((restaurant)=> 
  {
    $("#myModal").modal('show');
    document.getElementById("myModalLabel").textContent = restaurant.restaurantName;
    console.log(restaurant.restaurantName);
    var myList = document.createElement('ul');

    var ratings = restaurant.ratings;
    for (var j = 0; j < ratings.length; j++) 
    {
      var listItem = document.createElement('li');
      listItem.textContent = ratings[j].stars + ratings[j].comment;
      myList.appendChild(listItem);
      console.log(myList);
      document.getElementById('myModalBody').appendChild(myList);
    }
  })
}

function addNewMarker(jsonObj) 
{
  var restos = jsonObj['restaurants'];
  var restaurant,LatLng ;
  for (i in restos)
  {
    restaurant=restos[i];
    LatLng = new google.maps.LatLng(restaurant.lat,restaurant.long);
      var marker= new google.maps.Marker
      ({
        position: LatLng,
        map: map,
        title: restaurant.restaurantName
      });
  }
}
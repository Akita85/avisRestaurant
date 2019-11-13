const restaurantID = document.getElementById('restaurants');
//var restaurantDetails = document.getElementById('RestaurantDetails');

const requestULR = 'https://raw.githubusercontent.com/Akita85/avisRestaurant/master/json/restaurant.json';
let request = new XMLHttpRequest();
request.open('GET', requestULR);
request.responseType = 'json';
request.send();

request.onload = function() 
{
  const restaurants = request.response;
  listRestaurantsHTML(restaurants);
  addNewMarker(restaurants);  
}

function calculateAverageRatingRestaurant(restaurant)
{
 let totalRating = 0;
 let averageRating = 0;

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
 let roundedAverageRating = Math.round(averageRating*10)/10;
  return roundedAverageRating;
}

function listRestaurantsHTML(jsonObj) 
{
  let restos = jsonObj['restaurants'];
  
  restos.forEach((restaurant)=> {
    let totalStars = 5;
    let averRatingToShow = calculateAverageRatingRestaurant(restaurant);
    let starPercentage = Math.round((averRatingToShow/totalStars)*100);
    let myArticle = document.createElement('article');
    let myH5 = document.createElement('h5');
    let myPara2 = document.createElement('p');
    let myPara1 = document.createElement('p');

    let divStarsOuter = document.createElement('div');
    divStarsOuter.className = 'stars-outer';
    let divStarsInner = document.createElement('div');
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

    myArticle.addEventListener('click', function(e)
    {
      infoRestaurants(restaurant);          
    }); 
  })
}

function infoRestaurants(restaurant) 
{
  let myModalLabel = document.getElementById('myModalLabel');
  let myModalBody = document.getElementById('myModalBody');

  myModalLabel.innerHTML = ""; 
  document.getElementById("myModalImg").innerHTML = ""; 
  myModalBody.innerHTML = "";
  
  let pos = {
    lat: restaurant.lat,
    lng: restaurant.long
  };

  let location = pos.lat+","+ pos.lng;        

    let totalStars = 5;
    let averRatingToShow = calculateAverageRatingRestaurant(restaurant);
    let starPercentage = Math.round((averRatingToShow/totalStars)*100);

    $("#myModal").modal('show');

    let myH6 = document.createElement('h6');
    let myPara = document.createElement('p');
    let myPara2 = document.createElement('p');
    let divStarsOuter = document.createElement('div');
    divStarsOuter.className = 'stars-outer';
    let divStarsInner = document.createElement('div');
    divStarsInner.className = 'stars-inner';
    divStarsInner.style.width = `${starPercentage}%`;


    myH6.textContent = restaurant.restaurantName ;
    myPara.textContent = 'Adresse : ' + restaurant.address;
    myPara2.textContent = averRatingToShow + '  ';

    myPara2.appendChild(divStarsOuter);
    divStarsOuter.appendChild(divStarsInner);
    myModalLabel.appendChild(myH6);
    myModalLabel.appendChild(myPara2);
    myModalLabel.appendChild(myPara);


    let url = "https://maps.googleapis.com/maps/api/streetview?size=400x400&location="+location+"&key=AIzaSyCA5arXTDsp5lB6iANmio2i9EER5jo6msM";
    ajaxGet(url,function() 
    {
    document.getElementById("myModalImg").src = url;    
    })

  restaurant.ratings.forEach((ratings)=> 
  {
    let totalStar = 5;
    let nbStars = ratings.stars;
    let percentageStars = Math.round((nbStars/totalStar)*100);

    let myList = document.createElement('ul');
    let listItem = document.createElement('li');
    let myPara1 = document.createElement('p');
    let myPara2 = document.createElement('p');
    let divStarsOuter2 = document.createElement('div');
    divStarsOuter2.className = 'stars-outer';
    let divStarsInner2 = document.createElement('div');
    divStarsInner2.className = 'stars-inner';
    divStarsInner2.style.width = `${percentageStars}%`;

    myPara1.textContent = nbStars + '  ';
    myPara2.innerHTML = ratings.comment + '<hr/>';

    myPara1.appendChild(divStarsOuter2);
    divStarsOuter2.appendChild(divStarsInner2);
    listItem.appendChild(myPara1);
    listItem.appendChild(myPara2);
    myList.appendChild(listItem);
    myModalBody.appendChild(myList);
  })
}

function addNewMarker(jsonObj) 
{
  let restos = jsonObj['restaurants'];
  let restaurant,LatLng ;
  for (i in restos)
  {
    restaurant=restos[i];
    LatLng = new google.maps.LatLng(restaurant.lat,restaurant.long);
      let marker= new google.maps.Marker
      ({
        position: LatLng,
        map: map,
        title: restaurant.restaurantName
      });
  }
}
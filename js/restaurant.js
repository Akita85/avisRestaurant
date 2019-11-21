const restaurantID = document.getElementById('restaurants');
let totalStars = 5;
var minRating = 0;
var maxRating = 5;
let restaurantList = new Array();

// ici j'appelle mon fichier JSON (Ajax)
const requestULR = 'https://raw.githubusercontent.com/Akita85/avisRestaurant/master/json/restaurant.json';
let request = new XMLHttpRequest();
request.open('GET', requestULR);
request.responseType = 'json';
request.send();

/* Je récupère les réponses, et j'appelle mes fonctions majeures dans request.onload 
pour que cela fonctionne et que cela récupère les infos du fichier JSON.
Je suis très liée à ce fichier en ligne. 
Je me dis que si j'arrive à le traduire en tableau javascript standard peut-être 
que cela serait plus propre et moins alambiqué */

request.onload = function() 
{
  const restaurants = request.response;
  listRestaurantsHTML(restaurants);
  addNewMarker(restaurants); 
  /*RestaurantInLimiteMap(restaurants); 
  (j'ai essayé d'appeler ici ma fonction pour afficher les restaurants visibles sur la carte 
   à priori cela ne plaît pas du côté de mon API)*/

   //fonction qui gère mon filtre par moyenne (Avis)
  $(function() {
    // Init jQuery UI slider range
    $("#slider-range").slider({
      range: true,
      min: 0,
      max: 5,
      step: 0.5,
      values: [0, 5],
      slide: function(event, ui) {
        $("#ratingRange").val(ui.values[0] + " - " + ui.values[1]);
        minRating = ui.values[0];      
        maxRating = ui.values[1];
        restaurantID.innerHTML = "";
        listRestaurantsHTML(restaurants);
      }
    });
    $("#ratingRange").val(
      $("#slider-range").slider("values", 0) +
        " - " +
        $("#slider-range").slider("values", 1)
    );
  });
}

//fonction me permettant de calculer la moyenne des avis des restaurants.
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

/* fonction me permettant d'afficher chacun de mes restaurants présents sur le fichier JSON
dans la liste à gauche de la carte.*/
function listRestaurantsHTML(jsonObj) 
{
  let restos = jsonObj['restaurants'];
  /* j'ai essayé ici de pousser les infos de mon fichier JSON dans un tableau, mais 
  cela me créait un tableau dans un tableau et je ne parviens pas non plus à récupérer les infos.*/
  restaurantList.push(restos); 
  let restaurant = restaurantList[0];
  console.log(restos);

  restos.forEach((restaurant)=> {

  let averRatingToShow = calculateAverageRatingRestaurant(restaurant);
  let starPercentage = Math.round((averRatingToShow/totalStars)*100);

  /*partie que je vais devoir factoriser car je l'utilise pratiquement 2 fois dans mon code, 
  sauf que l'un concerne la création d'un article et l'autre d'un modal*/
  let myArticle = document.createElement('article');
  myArticle.id = restaurant.restaurantName;
  myArticle.id = myArticle.id.replace(" ","");
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

  //grâce à cet évènement, je peux accéder aux informations d'un restau
  myArticle.addEventListener('click', function(e)
    {
      infoRestaurants(restaurant);          
    });    
    //RestaurantInLimiteMap(restaurant);
    checkAvgRateRestaurant(restaurant);
    })
}

/* voici la fonction qui me permet de récupérer les limites de ma carte et d'en faire une condition 
qui tient la route pour que seul les restaurants visibles sur la carte 
autour de l'utilisateur s'affichent. 
1er Problème : la récupération des coordonnées LAT et LNG de chaque restaurants 
depuis mon fichier JSON*/
function RestaurantInLimiteMap(restaurant) 
{
  var limite = map.getBounds();
  console.log(limite);
  let coordRestaurant = { lat: restaurant.lat, lng: restaurant.long };
  console.log(coordRestaurant);
  if(limite.contains(coordRestaurant)){
      console.log(coordRestaurant);
    } else {
        console.log('test OK NULL');
            }
}

/* concerne l'affichage des avis et commentaires ainsi que la streetview (avec API correspondante)
pour chaque restaurant.*/
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

/*Ajout des marqueurs pour chaque restaurant 
- il me reste à gérer l'affichage de ces derniers en fonction des filtres (moyenne Avis)*/
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

/* les 3 fonctions suivantes me permettent d'afficher 
les restaurants dans la liste à gauche de la maps,
en fonction des choix utilisateurs (moyennes des avis), 
il me reste à gérer, sur le même principe et en temps réel 
l'affichage des marqueurs correspondants sur la carte, 
ces derniers doivent s'afficher ou s'enlever */
function hideRestaurant(restaurant)
{
  let restauID = restaurant.restaurantName;
  restauID = restauID.replace(" ","");
  let selecteur = "#" + restauID;
  $(selecteur).hide();
}

function showRestaurant(restaurant)
{
  let restauID = restaurant.restaurantName;
  restauID = restauID.replace(" ","");
  let selecteur = "#" + restauID;
  $(selecteur).show();
}

function checkAvgRateRestaurant(restaurant)
{
    let averRating = calculateAverageRatingRestaurant(restaurant);
    if ((averRating >= minRating) && (averRating <= maxRating)){
        showRestaurant(restaurant);
    } else  {        
        hideRestaurant(restaurant);
            }
}
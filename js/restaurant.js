const restaurantID = document.getElementById('restaurants');
const totalStars = 5;
let minRating = 0;
let maxRating = 5;
let markers = [];
let listRestos = [];
let marker;
let addRestau = false;

// ici j'appelle mon fichier JSON (Ajax)
const requestULR = 'https://raw.githubusercontent.com/Akita85/avisRestaurant/master/json/restaurant.json';
let request = new XMLHttpRequest();
request.open('GET', requestULR);
request.responseType = 'json';
request.send();

/* Je récupère les réponses, et j'appelle mes fonctions majeures dans request.onload 
pour que cela fonctionne et que cela récupère les infos JSON.*/
request.onload = function() 
{
  const restaurants = request.response;
  creatArray();
  listRestaurantsHTML();
  google.maps.event.addListener(map, "center_changed", function(){
      updateNearbyrestaurant();
  });
  google.maps.event.addListener(map, 'bounds_changed', function(){
      checkRestaurant();
  });
  google.maps.event.addListener (map, 'rightclick', function(e){
      placeMarkerAndPanTo (e.latLng, map); 
  });

   //fonction qui gère mon filtre par moyenne (Avis)
  $(function()
  {
    // Init jQuery UI slider range
    $("#slider-range").slider(
    {
      range: true,
      min: 0,
      max: 5,
      step: 0.5,
      values: [0, 5],
      slide: function(event, ui) 
      {
        $("#ratingRange").val(ui.values[0] + " - " + ui.values[1]);
        minRating = ui.values[0];      
        maxRating = ui.values[1];
        restaurantID.innerHTML = "";
        listRestaurantsHTML();
        checkRestaurant();
      }
    });
    $("#ratingRange").val($("#slider-range").slider("values", 0)+" - " +$("#slider-range").slider("values", 1));
  });
}

function creatArray ()
{
  const restos = request.response['restaurants'];
  console.log(restos);
  for (let i = 0; i < restos.length; i++) 
    {
  let addRestaurant = {};
  let newRatings = [];
  addRestaurant.restaurantName = restos[i].restaurantName;
  addRestaurant.restaurantId = restos[i].restaurantId;
  addRestaurant.address = restos[i].address;
  addRestaurant.lat = restos[i].lat;
  addRestaurant.long = restos[i].long; 
  addRestaurant.ratings = newRatings;  

  for (let ratings of restos[i].ratings)
          {
           let rating = {};
            rating.stars = ratings.stars;
            rating.comment = ratings.comment;
            newRatings.push(rating);
          };
  listRestos.push(addRestaurant);
  console.log(listRestos);
}
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

/* fonction me permettant d'afficher chacun de mes restaurants
dans la liste à gauche de la carte.*/
function listRestaurantsHTML() 
{
  let restaurant;
  listRestos.forEach((restaurant)=> {
    affichageListRestaurant(restaurant);
    })
}

function affichageListRestaurant(restaurant)
{
  let averRatingToShow = calculateAverageRatingRestaurant(restaurant);
  let starPercentage = Math.round((averRatingToShow/totalStars)*100);

  let myArticle = document.createElement('article');
  myArticle.id = restaurant.restaurantId;
  myArticle.id = myArticle.id.replace(/ /g,"");
  let ArticleId = myArticle.id;
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

  myPara1.innerHTML = 'Adresse: ' + restaurant.address + '<hr/>';
            
  myPara2.appendChild(divStarsOuter);
  divStarsOuter.appendChild(divStarsInner);
  myArticle.appendChild(myH5);
  myArticle.appendChild(myPara2);
  myArticle.appendChild(myPara1);
  restaurantID.appendChild(myArticle);    

  //grâce à cet évènement, je peux accéder aux informations d'un restaurant
  myArticle.addEventListener('click', ()=>
    {
      infoRestaurants(restaurant);   
    }); 
}

function checkRestaurant()
{
    let bounds = map.getBounds();
    clearMarkers();
    for (i in listRestos) {
        restaurant = listRestos[i];
        let averRating = calculateAverageRatingRestaurant(restaurant);
        let coordRestaurant = { lat: restaurant.lat, lng: restaurant.long };
        let articleId = $('#'+restaurant['restaurantId']); 
        if ((bounds.contains(coordRestaurant)) && (averRating >= minRating) && (averRating <= maxRating)){
            articleId.show();
            addNewMarker(coordRestaurant, restaurant);
            articleId.on('mouseover', function(){
              for (let i = 0; i < markers.length; i++) {
                markers[i].setAnimation(null);
                if(articleId.find('h5').html() == markers[i].title){
                  toggleBounce(markers[i]);
                }
              }
            });
        } else {
            articleId.hide();
        }
    }
}

/* concerne l'affichage des avis et commentaires ainsi que la streetview (avec API correspondante)
pour chaque restaurant.*/
function infoRestaurants(restaurant) 
{
  let myModalLabel = document.getElementById('myModalLabel');
  let myModalBody = document.getElementById('myModalBody');
  let myModalImg = document.getElementById("myModalImg");
  let addRating = document.getElementById("addRating");

  myModalLabel.innerHTML = ""; 
  myModalImg.innerHTML = ""; 
  myModalBody.innerHTML = "";
    
  let pos = {
    lat: restaurant.lat,
    lng: restaurant.long
  };

  let location = pos.lat+","+ pos.lng;        

    let averRatingToShow = calculateAverageRatingRestaurant(restaurant);
    let starPercentage = Math.round((averRatingToShow/totalStars)*100);

    $("#myModal").modal('show');
    $('#myModal').modal('handleUpdate');

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
    let myPara2 = document.createElement('p');
    let myPara3 = document.createElement('p');
    let divStarsOuter2 = document.createElement('div');
    divStarsOuter2.className = 'stars-outer';
    let divStarsInner2 = document.createElement('div');
    divStarsInner2.className = 'stars-inner';
    divStarsInner2.style.width = `${percentageStars}%`;

    myPara2.textContent = nbStars + '  ';
    myPara3.innerHTML = ratings.comment + '<hr/>';

    myPara2.appendChild(divStarsOuter2);
    divStarsOuter2.appendChild(divStarsInner2);
    listItem.appendChild(myPara2);
    listItem.appendChild(myPara3);
    myList.appendChild(listItem);
    myModalBody.appendChild(myList);
  })
  addRating.addEventListener('click', function(e)
    {
      addRatingAndComment(restaurant);          
    })
}

/*Ajout des marqueurs pour chaque restaurant*/
function addNewMarker(LatLng, restaurant) 
{     let image = 'img/markerResto.png';
      marker= new google.maps.Marker
      ({
        position: LatLng,
        map: map,
        icon: image,
        title: restaurant.restaurantName,
      });
      markers.push(marker);
      marker.addListener("click", function() {
      infoRestaurants(restaurant);   
});
  }

function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Je retire les markers de la map, mais je les gardes dans le tableau.
function clearMarkers() {
  setMapOnAll(null);
}

// Afficher les markers
function showMarkers() {
  setMapOnAll(map);
}

// Supprimer tous les markers du tableau.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

function toggleBounce(ele) {
  if (ele.getAnimation() !== null) {
    ele.setAnimation(null);
  } else {
    ele.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ ele.setAnimation(null); }, 1500);
  }
}

function addRatingAndComment(restaurant)
{
  let myModalLabelAddRating = document.getElementById('myModalLabelAddRating');
  let myModalBodyAddRating = document.getElementById('myModalBodyAddRating');

  myModalLabelAddRating.innerHTML = ""; 
  myModalBodyAddRating.innerHTML = "";

  $("#myModalAddRating").modal('show');

  let myH6Bis = document.createElement('h6');
  myH6Bis.textContent = restaurant.restaurantName ;
  myModalLabelAddRating.appendChild(myH6Bis);
    

  let formElt = document.createElement("form");
  formElt.className ="md-form border border-light p-2";
  let selectElt = document.createElement("select");
  selectElt.id = "rating";
  selectElt.className = "browser-default custom-select";
  // Choix de la valeur/note obligatoire
  selectElt.required = true; 
  let optionDefaultElt = document.createElement("option");
  optionDefaultElt.value = "";
  optionDefaultElt.textContent = "Notez le restaurant";
  selectElt.appendChild(optionDefaultElt);
  // Options
  for (i=0; i<6; i++) 
  {
    let optionElt = document.createElement("option");
    optionElt.value = i;
    optionElt.textContent = i;
    selectElt.appendChild(optionElt);
  }

  formElt.appendChild(selectElt);
  textAreaElt = document.createElement("textarea");
  textAreaElt.className = "md-textarea form-control";
  textAreaElt.id = "comment";
  textAreaElt.rows = 3;
  textAreaElt.cols = 30;
  textAreaElt.placeholder = "Votre commentaire ...";
  formElt.appendChild(textAreaElt);
  let inputElt = document.createElement("input");
  inputElt.type = "submit";
  inputElt.value = "Valider";
  inputElt.className = "btn btn-secondary";
  formElt.appendChild(inputElt);
  formElt.addEventListener("submit", function (e) {
    let rating = Number(formElt.elements.rating.value);
    let comment = formElt.elements.comment.value;
    let rate = 
    {
      "stars": rating,
      "comment": comment,
    };
    restaurant.ratings.unshift(rate);
    // Annulation de l'envoi des données    
    e.preventDefault(); 
    infoRestaurants(restaurant);
    restaurantID.innerHTML = "";
    listRestaurantsHTML();
    checkRestaurant();
    $("#myModalAddRating").modal('hide');
  });
  myModalBodyAddRating.appendChild(formElt);
}

// Evènement au clic sur le bouton d'ajout de restaurant
    btn_ajout_restau.addEventListener("click", function() {
        // Reset du formulaire
        form_Addrestau.reset();
        // On déroule le formulaire
        $(form_Addrestau).slideToggle();
        // Focus sur le champ de nom
        document.querySelector("#form_Addrestau input").focus();
        // On passe en mode d'ajout de restaurant
        addRestau = true;
    });

function placeMarkerAndPanTo (latLng, map) {
    // On vérifie qu'on est en mode ajout de restaurant
        if (addRestau === true){
            // On vérifie que les champs nom et type sont remplis
            if (ipt_name_restau.value){
                let lat = latLng.lat();
                let lng = latLng.lng();
                let newCoordonnées = { lat: lat, lng: lng };
                let geocoder = new google.maps.Geocoder;
                geocodeLatLng(geocoder, newCoordonnées);
            }
            else{
                // On affiche le message d'erreur
                $(err_msg).slideToggle();
                // On le masque au bout de 3 secondes
                setTimeout(function(){$(err_msg).slideToggle();}, 3000);
            }
        // On referme le formulaire
        $(form_Addrestau).slideToggle();
        // On enlève le mode ajout de restaurant
        addRestau = false;
        }   
      }

// Reverse Geocoding
function geocodeLatLng(geocoder, latLng) {  
  geocoder.geocode({'location': latLng}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {                
        lat = results[0].geometry.location.lat(); 
        lng = results[0].geometry.location.lng();
        let addNewRestaurant = {};
        let newRatings = [];
        let addressGeocode = results[0].formatted_address;
        addNewRestaurant.restaurantName = ipt_name_restau.value;
        addNewRestaurant.restaurantId = ipt_name_restau.value.replace(/ /g,"");
        addNewRestaurant.address = addressGeocode;
        addNewRestaurant.lat = lat;
        addNewRestaurant.long = lng;
        addNewRestaurant.ratings = newRatings;
        listRestos.unshift(addNewRestaurant);
        map.panTo (latLng);
        restaurantID.innerHTML = "";
        listRestaurantsHTML();
        checkRestaurant();
      } else {
        window.alert('Pas de résultat connu');        
      }
    } else {
      window.alert('Echec du geocoder : ' + status);      
    }
  }); 
}

function updateNearbyrestaurant()
{
  let center = map.getCenter();
  let lat = center.lat();
  let lng = center.lng();
  let location = { lat: lat, lng: lng }; 
  // demande : trouver les restaurants situés autour de la situation/location.
  let service;
  let request = {
    location: location,
    radius: '800',
    type: ['restaurant']
  };
  service = new google.maps.places.PlacesService(map);  
  service.nearbySearch(request, addRestaurant);
}

function addRestaurant(results, status)
{
  if (status == google.maps.places.PlacesServiceStatus.OK) 
  {
    for (let i = 0; i < results.length; i++) 
    {
      let addRestaurantPlace = {};
      let newRatingsPlaces = [];
      addRestaurantPlace.restaurantName = results[i].name;
      addRestaurantPlace.restaurantId = results[i].place_id;
      addRestaurantPlace.address = results[i].vicinity;
      addRestaurantPlace.lat = results[i].geometry.location.lat();
      addRestaurantPlace.long = results[i].geometry.location.lng();  
      addRestaurantPlace.ratings = newRatingsPlaces; 
      
      // demande : envoyer les avis et commentaires de chaque restaurant
      let request = 
      {
        placeId: results[i].place_id,
        fields: ['reviews']
      };      
        
      let service = new google.maps.places.PlacesService(map);
      service.getDetails(request, function(place, status) 
      {
        if (status === google.maps.places.PlacesServiceStatus.OK) 
        {
          if (place.reviews){
          // On boucle sur les avis
          for (let review of place.reviews)
          {
           let view = {};
            view.stars = review.rating;
            view.comment = review.text;
            newRatingsPlaces.push(view);
          };
          let restauInList = false;
          listRestos.forEach(function(restaurant) {
            if(addRestaurantPlace.restaurantId==restaurant.restaurantId){
              restauInList = true;
            }
          }); 
          if(restauInList == false) {
        listRestos.push(addRestaurantPlace);
        console.log(listRestos);
          };
      }
      restaurantID.innerHTML = "";
      listRestaurantsHTML();
      checkRestaurant();
    }
  });
}
}
}
class restaurantList
{
  constructor(){
    this.listRestos = [];
    this.createArray();
    this.listRestaurantsHTML();
  }

  // Gestion de l'affichage des restaurants
  displayRestaurants()
  {
    $("#restaurants").empty();
    this.listRestaurantsHTML();
    this.checkRestaurant();
  }

  loadRestaurant(requestULR, callback)
  {
      let request = new XMLHttpRequest();
      request.open('GET', requestULR);
      request.responseType = 'json';
      request.addEventListener("load", () => {
          if (request.status >= 200 && request.status < 400) {
              callback(request.response);
          }
      });
      request.send();
  }

  // J'envoie mes données du fichier restaurant.json dans mon tableau listRestos
  createArray()
  {
     this.loadRestaurant('https://raw.githubusercontent.com/Akita85/avisRestaurant/master/json/restaurant.json',(response) => {
         this.generateArray(response, () => {this.listRestaurantsHTML()});
     });
  }

  generateArray(response, callback)
  {
    let restos = response['restaurants'];
    for (let i = 0; i < restos.length; i++){
      let addRestaurantJSON = new restaurant (
        restos[i].restaurantName,
        restos[i].restaurantId,
        restos[i].address,
        restos[i].lat,
        restos[i].long,
      );
      let newRatings = [];
      addRestaurantJSON.ratings = newRatings;
      this.listRestos.unshift(addRestaurantJSON);
      for (let ratings of restos[i].ratings){
        let rating = {};
        rating.stars = ratings.stars;
        rating.comment = ratings.comment;
        newRatings.push(rating);
      };
    }
    callback();
  }

  // Attribue les données/détails de chaque restaurant aux éléments HTML correspondants
  listRestaurantsHTML()
  {
    this.listRestos.forEach((restaurant)=>{
      restaurant.createRestaurantList();
    })
  }

  // fonction me permettant de gérer l'affichage uniquement des restaurants visibles sur la carte et selon le filtre des avis
  checkRestaurant()
  {
    // On récupère les limites de la map avec getBounds()
    let bounds = map.getBounds();
    newMap.clearMarkers();
    let listRestos = this.listRestos;
    let i;
    for (i in listRestos){
      let restaurant = this.listRestos[i];
      let averRating = restaurant.calculateAverageRatingRestaurant();
      let coordRestaurant = { lat: restaurant.lat, lng: restaurant.long };
      let articleId = $('#'+restaurant['id']);
      if ((bounds.contains(coordRestaurant)) && (averRating >= minRating) && (averRating <= maxRating)){
        articleId.show();
        newMap.addNewMarker(coordRestaurant, restaurant);
        articleId.on('mouseover', ()=>{
          for (let i = 0; i < newMap.markers.length; i++){
            newMap.markers[i].setAnimation(null);
            if(articleId.find('h5').html() == newMap.markers[i].title){
              newMap.toggleBounce(newMap.markers[i]);
            }
          }
        });
      } else {
        articleId.hide();
      }
    }
  }

  // Création d'un marqueur à l'endroit où l'utilisateur a cliqué sur la map
  placeMarkerAndPanTo (latLng, map)
  {
    // On vérifie qu'on est en mode ajout de restaurant
    if (addRestau === true){
      // On vérifie que le champs nom est rempli
      if (ipt_name_restau.value){
        let lat = latLng.lat();
        let lng = latLng.lng();
        let newCoordonnées = { lat: lat, lng: lng };
        let geocoder = new google.maps.Geocoder;
        restaurantManager.geocodeLatLng(geocoder, newCoordonnées);
      } else {
        // sinon on affiche le message d'erreur
        $(err_msg).slideToggle();
        // On le masque au bout de 3 secondes
        setTimeout(()=>{$(err_msg).slideToggle();}, 3000);
      }
        // On referme le formulaire
        $(form_Addrestau).slideToggle();
        // On enlève le mode ajout de restaurant
        addRestau = false;
    }
  }

  // Geocoding inversé. On demande l'adresse correspondant à une latitude/longitude données
  geocodeLatLng(geocoder, latLng)
  {
    geocoder.geocode({'location': latLng}, (results, status)=> {
      if (status === 'OK') {
        if (results[0]) {
          let addRestaurant = new restaurant (
            ipt_name_restau.value,
            ipt_name_restau.value.replace(/ /g,""),
            results[0].formatted_address,
            latLng.lat,
            latLng.lng
          );
          addRestaurant.averageRating = '';
          addRestaurant.ratings = [];
          this.listRestos.unshift(addRestaurant);
          map.panTo (latLng);
          this.displayRestaurants();
        } else {
          window.alert('Pas de résultat connu');
        }
      } else {
        window.alert('Echec du geocoder : ' + status);
      }
    });
  }

  // demande de recherche de restaurants à proximité, dans une zone spécifiée - ici autour du centre de la carte
  updateNearbyrestaurant()
  {
    let center = map.getCenter();
    let lat = center.lat();
    let lng = center.lng();
    let location = { lat: lat, lng: lng }; 
    // demande : trouver les restaurants situés autour du centre de la map dans un rayon de 800m.
    let request = 
    {
      location: location,
      radius: '800',
      type: ['restaurant']
    };
    let service = new google.maps.places.PlacesService(map);  
    service.nearbySearch(request, this.addRestaurant.bind(this));
  }

  /* Fonction Callback - Utilisation de l'API Google Place pour récupérer 
  les informations/détails concernant chaque restaurant */
  addRestaurant(results, status)
  {
    if (status == google.maps.places.PlacesServiceStatus.OK){
      for (let i = 0; i < results.length; i++) 
      {
        let newRatingsPlaces = [];
        let addRestaurantPlace = new restaurant (
        results[i].name,
        results[i].place_id,
        results[i].vicinity,
        results[i].geometry.location.lat(),
        results[i].geometry.location.lng(),
        );
        addRestaurantPlace.ratings = newRatingsPlaces; 
        if (!results[i].rating){
          addRestaurantPlace.averageRating = '';
        } else {
          addRestaurantPlace.averageRating = results[i].rating;
        }           
        
        /* permet de ne pas afficher plusieurs fois un restaurant déjà présent dans le tableau listRestos - 
        afin d'éviter les doublons à l'affichage */
        let restauInList = false;
        this.listRestos.forEach((restaurant)=> 
        {
          if(addRestaurantPlace.id==restaurant.id){
            restauInList = true;
          }
        }); 
          if(restauInList == false){
            this.listRestos.push(addRestaurantPlace);
          };
        this.displayRestaurants();
      }
    }
  }
}
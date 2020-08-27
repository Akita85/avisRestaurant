class myMap
{
    constructor(map){
        this.map = map;
        this.markers = [];
    }

    //HTML5 geolocalisation
    userPosition ()
    {
        if (navigator.geolocation) {
            // on récupère la position de l'utilisateur s'il a accepté la géolocalisation
            navigator.geolocation.getCurrentPosition((position)=>{
                let pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
                };

                // on affiche un marker spécifique pour la position de l'utilisateur
                let image = 'http://maps.google.com/mapfiles/kml/pushpin/ltblu-pushpin.png';
                let marker = new google.maps.Marker({
                        position: pos,
                        map: this.map,
                        icon: image,
                        animation: google.maps.Animation.DROP,
                        title:"Tu es là"
                    });

                marker.setMap(map);
                this.map.setCenter(pos);

            }, () =>{
                    this.handleLocationError(true, infoWindow, this.map.getCenter());
                });
        } else {
            // si la Géolocalisation n'est pas prise en charge
            this.handleLocationError(false, infoWindow, this.map.getCenter());
        }
    }

    // Ajout des markers pour chaque restaurant
    addNewMarker(LatLng, restaurant)
    {
        let image = 'img/markerResto.png';
        let marker= new google.maps.Marker({
            position: LatLng,
            map: this.map,
            icon: image,
            title: restaurant.name,
        });
        this.markers.push(marker);
        marker.addListener("click", ()=> {
            restaurant.infoRestaurants();
        });
    }

    setMapOnAll(map)
    {
        for (let i = 0; i < this.markers.length; i++){
            this.markers[i].setMap(map);
        }
    }

    // Retire les markers de la map, mais je les garde dans le tableau.
    clearMarkers()
    {
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers.length = 0;
    }

    toggleBounce(ele)
    {
        if (ele.getAnimation() !== null){
            ele.setAnimation(null);
        } else {
            ele.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(()=>{ ele.setAnimation(null); }, 1500);
        }
    }

    /* fonction permettant de gérer la non prise en charge de la géolocalisatin
    et de centrer la map sur Paris par défaut */
    handleLocationError(browserHasGeolocation, infoWindow, pos)
    {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                                    'Vous êtes centré sur Paris par défaut' :
                                    'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
        // On affiche les restaurants situés autour du centre par défaut
        restaurantManager.updateNearbyrestaurant();
    }
}

let map, newMap, infoWindow, restaurantManager;

function initMap()
{   // initialisation de la map
    map = new google.maps.Map(document.getElementById('map'),
    // centre par défaut, si l'utilisateur n'autorise pas la géolocalisation
    {center: {lat: 48.862725, lng: 2.287592}, zoom: 15});
    infoWindow = new google.maps.InfoWindow();

    // initialisation de mes objets newMap et restaurantManager.
    newMap = new myMap(map);
    newMap.userPosition();
    restaurantManager = new restaurantList();

    /* 3 gestionnaires d'événements liés à la map qui prennent un événement à écouter et une fonction 
    à appeler lorsque les événements spécifiés se produisent */
    google.maps.event.addListener(map, 'bounds_changed', ()=> {
        restaurantManager.checkRestaurant();
    });

    google.maps.event.addListener (map, 'rightclick', (e)=> {
        restaurantManager.placeMarkerAndPanTo(e.latLng, newMap.map);
    });

    google.maps.event.addListener(map, "center_changed", ()=> {
        restaurantManager.updateNearbyrestaurant();
    });
}


    let map, infoWindow;
    
function initMap() 
{
    map = new google.maps.Map(document.getElementById('map'), 
    // centre par défaut, si l'utilisateur n'autorise pas la géolocalisation
    {center: {lat: 48.862725, lng: 2.287592}, zoom: 15}); 
    infoWindow = new google.maps.InfoWindow();

    //HTML5 geolocalisation.
    if (navigator.geolocation) 
    {
        navigator.geolocation.getCurrentPosition(function(position)
        {
            let pos = 
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            // marqueur spécifique pour la position de l'utilisateur
            let image = 'http://maps.google.com/mapfiles/kml/pushpin/ltblu-pushpin.png';
            let marker = new google.maps.Marker(
                {
                    position: pos, 
                    map: map, 
                    icon: image, 
                    animation: google.maps.Animation.DROP,
                    title:"Tu es là"
                });

            marker.setMap(map);
            map.setCenter(pos);

        }, function() 
            {
                handleLocationError(true, infoWindow, map.getCenter());
            });
    } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
    }
}


function handleLocationError(browserHasGeolocation, infoWindow, pos) 
{
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                                'Vous êtes centré sur Paris par défaut' :
                                'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}





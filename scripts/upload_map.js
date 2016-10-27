//Set up some of our variables.
var map; //Will contain map object.
var marker = false; ////Has the user plotted their location marker? 
        
//Function called to initialize / create the map.
//This is called when the page has loaded.
function initMap() {

    //The center location of our map.
    var centerOfMap = new google.maps.LatLng(4.0383, 21.7587);

    //Map options.
    var options = {
      center: centerOfMap, //Set center.
      zoom: 12 //The zoom value.
    };

    //Create the map object.
    map = new google.maps.Map(document.getElementById('map'), options);

    // Marker
    var marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP
    });

    // Comment out to see infowindows
    var infowindow = new google.maps.InfoWindow();

    // Set HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        centerOfMap = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(centerOfMap);
        marker.setPosition(centerOfMap)
        //Get the marker's location.
        var currentLocation = marker.getPosition();
        var lat_val = currentLocation.lat();
        var lng_val = currentLocation.lng();
        var str = "Coordinates: ( Latitude: "+lat_val+", Longitude: "+lng_val+" )";
        //Add lat and lng values to a field that we can save.
        document.getElementById('coordinates').value = str;
        // Copy to global lat/lng
        lat = lat_val;
        lng = lng_val;
      }, function() {
        console.log("Geolocation Error: Service Failed.")
      });
    } else {
      // Browser doesn't support Geolocation
      console.log("Geolocation Error: Browser not supported.")
    }

    //Listen for any clicks on the map.
    google.maps.event.addListener(map, 'click', function(event) {    

        //Get the location that the user clicked.
        var clickedLocation = event.latLng;

        // Remove existing marker
        marker.setMap(null);

        //Create the marker.
        marker = new google.maps.Marker({
            position: clickedLocation,
            map: map,
            draggable: true //make it draggable
        });

        google.maps.event.addListener(marker, 'dragend', function(event){
            //Get the marker's location.
            var currentLocation = marker.getPosition();
            var lat_val = currentLocation.lat();
            var lng_val = currentLocation.lng();
            var str = "Coordinates: ( Latitude: "+lat_val+", Longitude: "+lng_val+" )";
            //Add lat and lng values to a field that we can save.
            document.getElementById('coordinates').value = str;
            // Copy to global lat/lng
            lat = lat_val;
            lng = lng_val;

        });

        //Get the marker's location.
        var currentLocation = marker.getPosition();
        var lat_val = currentLocation.lat();
        var lng_val = currentLocation.lng();
        var str = "Coordinates: ( Latitude: "+lat_val+", Longitude: "+lng_val+" )";
        //Add lat and lng values to a field that we can save.
        document.getElementById('coordinates').value = str;
        // Copy to global lat/lng
        lat = lat_val;
        lng = lng_val;

    });

    var input = document.getElementById('pac-input');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    autocomplete.addListener('place_changed', function() {

      marker.setVisible(false);
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);  // Why 17? Because it looks good.
      }
      marker.setIcon(/** @type {google.maps.Icon} */({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
      }));
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

        ////Comment out to see infowindows
        //infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        //infowindow.open(map, marker);

        //Get the marker's location.
        var currentLocation = marker.getPosition();
        var lat_val = currentLocation.lat();
        var lng_val = currentLocation.lng();
        var str = "Coordinates: ( Latitude: "+lat_val+", Longitude: "+lng_val+" )";
        //Add lat and lng values to a field that we can save.
        document.getElementById('coordinates').value = str;
        // Copy to global lat/lng
        lat = lat_val;
        lng = lng_val;
      });

}

//Load the map when the page has finished loading.
google.maps.event.addDomListener(window, 'load', initMap);
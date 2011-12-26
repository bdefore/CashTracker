 function showOnMap(lat, lon)
 {

   var mapcanvas = document.createElement('div');
   mapcanvas.id = 'mapcanvas';
   mapcanvas.style.height = '400px';
   mapcanvas.style.width = '560px';
    
   // TO FIX: Get the DOM out of here
   document.getElementById('mapContainer').appendChild(mapcanvas);
  
   var latlng = new google.maps.LatLng(lat, lon);
   var myOptions = {
     zoom: 15,
     center: latlng,
     mapTypeControl: false,
     navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
     mapTypeId: google.maps.MapTypeId.ROADMAP
   };
   var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
  
   var marker = new google.maps.Marker({
       position: latlng, 
       map: map, 
       title:"You are here!"
   });

   // TO FIX: Get the DOM out of here
   document.getElementById("latitudeInput").value = lat;
   document.getElementById("longitudeInput").value = lon;
 }

function geoCodeSuccess(position) {
  console.log('success geocoding')

  showOnMap(position.coords.latitude, position.coords.longitude)
 }

 function geoCodeError(msg) {
  console.log('error geocoding')
  
   // console.log(arguments);
 }

 if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(geoCodeSuccess, geoCodeError);
 } else {
   error('not supported');
 }
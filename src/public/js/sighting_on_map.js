function createMap(container, lat, lon, zoom)
{
  var mapcanvas = document.createElement('div');
  mapcanvas.id = 'mapcanvas';
  mapcanvas.style.height = '400px';
  mapcanvas.style.width = '560px';

  // TO FIX: Get the DOM out of here
  container.appendChild(mapcanvas);

  var latlng = new google.maps.LatLng(lat, lon);
  var myOptions = {
   zoom: zoom,
   center: latlng,
   mapTypeControl: false,
   navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
   mapTypeId: google.maps.MapTypeId.TERRAIN
  };
  var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
  return map
}
function showOnMap(lat, lon, map)
{
  var latlng = new google.maps.LatLng(lat, lon);
  var marker = new google.maps.Marker({
     position: latlng, 
     map: map, 
     title:"Location of sighting"
  });
}
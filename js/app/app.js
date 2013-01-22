var startApp = function() {
  debug('started');
  document.addEventListener("backbutton", function(e){
        if($.mobile.activePage.is('#home')){
            e.preventDefault();
            navigator.app.exitApp();
        }
        else {
            navigator.app.backHistory()
        }
  }, false);

};

var showDialog = function(txt, time) {
    $('#stat').html(txt).fadeIn();
    if (time) {
        setTimeout(function(){hideDialog()}, time*1000);
    }
}

var hideDialog = function() {
    $('#stat').fadeOut();
}

var $map;
var $carMark;
var mapLoaded = false;
var db = window.localStorage;

function loadMap(el) {

    var the_height = ($(window).height() - $(el).find('[data-role="header"]').height() - $(el).find('[data-role="footer"]').height());
    $(el).height($(window).height()).find('[data-role="content"]').height(the_height);
    $('#map').gmap({ 'center': new google.maps.LatLng(42.345573,-71.098326), 'callback': function() {
        debug('Google map loaded!');
    }});
    $map = $('#map').gmap('get', 'map');
    mapLoaded = true;
}

function showCarMarker(oldPos) {

    $('#map').gmap('clear', 'markers');


    if (!oldPos) {
        showDialog('getting car position');
        //detect car position
        navigator.geolocation.getCurrentPosition(
            function(p){
                var pos = new google.maps.LatLng(p.coords.latitude,p.coords.longitude)
                $carMark = $('#map').gmap('addMarker', {'icon':'img/car.png','shadow':'img/shadow.png', 'position': pos, 'draggable': true});

                $map.panTo(pos)
                console.log(pos)
                db.setItem('carPosLat', pos.lat());
                db.setItem('carPosLng', pos.lng());
                $map.setZoom(18);
                google.maps.event.addListener($map, 'click', function(point) {


                    $carMark[0].setPosition(point.latLng);
                    $map.panTo(point.latLng);
                    debug(point.latLng);
                    db.setItem('carPosLat', point.latLng.lat());
                    db.setItem('carPosLng', point.latLng.lng());
                    showDialog("position saved", 2);
                });

                $carMark.dragend(function(e){
                    var pos = $carMark[0].getPosition();
                    $carMark[0].setPosition(pos);
                    $map.panTo(pos);
                    debug(pos)
                    db.setItem('carPosLat', pos.lat());
                    db.setItem('carPosLng', pos.lng());
                    showDialog("position saved", 2);
                });



                showDialog("position saved", 2);

                },

            function(e){console.log("error")}

        );
    } else {

        var lat = db.getItem('carPosLat');
        var lng = db.getItem('carPosLng');
        if (lat == null) {
            showDialog("no position stored", 2);
        }
        pos = new google.maps.LatLng(lat, lng)
        debug(pos)
        $carMark = $('#map').gmap('addMarker', {'icon':'img/car.png','shadow':'img/shadow.png', 'position': pos, 'draggable': false});
        $map.panTo(pos)
                $map.setZoom(18);
        showDialog("position retrieved", 2);
    }
}

$('#mapPage').live('pageshow', function() {
    console.log(document.location.href);
    //var p = new RegExp("^.*\?");
    //var page = document.location.href.replace(p, "");
    var page = document.location.href.split("?")[1];
    console.log("page", page)
    if (!mapLoaded) {
        loadMap(this);
    }
    if (page == 'read') {
        showCarMarker(db.getItem('carPos'));
    } else {
        showCarMarker();
    }


});

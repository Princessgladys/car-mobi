var $map;
var $carMark;
var mapLoaded = false;
var db = window.localStorage;

$(document).on("mobileinit", function(){
    $.mobile.defaultPageTransition = 'none';
    $.mobile.loadingMessage = "initializing";
    $.mobile.loadingMessageTextVisible = true;
});

var startApp = function() {
    debug('started');

    //backbutton: close on home, go back on others
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

// show status box for a give num of secs
var showDialog = function(txt, secs) {
    $('#stat').html(txt).fadeIn();
    if (time) {
        setTimeout(function(){hideDialog()}, secs*1000);
    }
}

// forcefully hide the status box
var hideDialog = function() {
    $('#stat').fadeOut();
}


//load map
function loadMap(el, cb) {
    //fill the whole content area
    var the_height = ($(window).height() - $(el).find('[data-role="header"]').height() - $(el).find('[data-role="footer"]').height());
    $(el).height($(window).height()).find('[data-role="content"]').height(the_height);

    //create the map then wait till it's full loaded to continue
    //this is because it may not pan to the saved/detected spot if not fully loaded
    $('#map').gmap().one('init', function(evt, map) {
        showDialog('loading the map...');
        $map = $('#map').gmap('get', 'map');
        google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
            // do something only the first time the map is loaded
            debug('Google map fully loaded!');
            mapLoaded = true;
            cb();
        });

    });

}

// show car marker on the map
function showCarMarker(old) {
    if (!old) {
        debug("no position stored...")
        showDialog('getting car position');
        //detect car position
        navigator.geolocation.getCurrentPosition(
            function(p){
                var pos = new google.maps.LatLng(p.coords.latitude,p.coords.longitude)
                $carMark = $('#map').gmap('addMarker', {'icon':'img/car.png','shadow':'img/shadow.png', 'position': pos, 'draggable': true});

                $map.panTo(pos)
                debug(pos)
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


                showDialog("Position saved.<br />You can click anywhere on the screen to change it.", 5);


                },

            function(e){debug("error")}

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
        $map.setCenter(pos)
        $map.setZoom(18);
        showDialog("position retrieved", 2);
    }
}

//-------------- page functions --------------------------------------

$('#mapPage').live('pagebeforeshow', function(){
    //clear markers (if any) before showing the page
    try {
        $('#map').gmap('clear', 'markers');
    } catch (e) {

    }

});



$('#mapPage').live('pageshow', function() {

    var go = function() {
        //url is like #mapPage?show or #mapPage?set
        var page = document.location.href.split("?")[1];
        debug("page")
        debug(page);
        if (page == 'read') {
            debug("reading stored position");
            showCarMarker(true);
        } else {
            showCarMarker();
        }
    }

    if (!mapLoaded) {
        debug("loading map");
        loadMap(this, go);
    } else {
        debug("map loaded already")
        go();
    }
});

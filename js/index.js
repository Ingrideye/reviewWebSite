//    ajaxGet(restauUrl, initMarkers);

let markers         = [];
let markersFiltered = [];




/******     Map settings with Google API - Geolocation - Makers ******/

function getRestaus(position) {
    const request = {
        location    : position,
        radius      :'5000',
        type        :['restaurant'],
    };

    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(response, status){
        initMarkers(response, status, service);
    });
}


function initMap(positionUser, infoWindow, messageError) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: positionUser,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.HYBRID,
    });
    geocoder = new google.maps.Geocoder;

    google.maps.event.addListener(map, 'click', function(event) {
      const marker = new google.maps.Marker({
        position: event.latLng, // {lat : 46.2658574733, lng: 78.574746546}
        map: map
      });
      google.maps.event.addListener(marker, 'click', function() {
        initNewMarkerFormInInfoWindow(infoWindow, event.latLng);
        infoWindow.open(map, marker);
      });
    });
    
        
    const marker = new google.maps.Marker();
    marker.setMap(map),
    marker.setPosition(positionUser);
    marker.addListener('mouseover', function () {
        infoWindow.open(map, marker);
    });
    marker.addListener('mouseout', function () {
        infoWindow.close();
    });
    marker.setIcon({
        url: "image/marker-green.png",
        scaledSize: new google.maps.Size(20, 32), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0),
        animation: google.maps.Animation.DROP,
    });
    infoWindow.setContent(messageError ? messageError : 'Je suis ici');

    getRestaus(positionUser);

    let newPosition;
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', function(){
        newPosition = {lat: map.getCenter().lat(), lng: map.getCenter().lng()};
        getRestaus(newPosition);
    });
}


function initMarkers(result, status, service) {
    
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        
        const icon = {
            url: "image/place.png", // url
            scaledSize: new google.maps.Size(20, 32), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        };
        
        const restoListElt = document.getElementById('list');

        result.forEach(function(marker) { 
            let request_ = {
                placeId: marker.place_id,
                fields: ['review', 'name', 'geometry', 'url', 'rating', 'adr_address', 'photo']
            };

            service.getDetails(request_, function(place, status) {
                createMarker(place, status, icon, map);
                buildNewRestoDivInAside(place, status, restoListElt);
            });
        }); 
        
    } else {
        console.log('Erreur de chargement du restau : ' , status);
    }
}


function createMarker(place, status, icon, map) {
    
    if (status == google.maps.places.PlacesServiceStatus.OK) {

        let marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            icon: icon,
            title: place.name,
            review: place.review,
            rating : place.rating,
            url : place.url,
            address : place.adr_address,
            animation: google.maps.Animation.DROP,
            shouldOpen: true,
        });
        
        markers.push(marker);

        // Ajout d'une InfoWindow
        let htmlContent = '<div class="info-window-container">';
        htmlContent += ' <h3>' + marker.title + '</h3><br><br><br>';
        htmlContent += ' <h5>' + marker.address + '</h5><br>';
        htmlContent += ' <p>'  + displayStars(marker.rating) + '</p>';
        htmlContent += ' <p>' + marker.rating + '</p>';
        htmlContent += ' <a href=\'' + marker.url + '\'>' + 'Voir plus</a>';
        htmlContent += '</div>';

        let infoWindow = new google.maps.InfoWindow({
            content: htmlContent
        });

        marker.addListener('click', function (evenement) { 
            this.shouldOpen ? infoWindow.open(map, this) : infoWindow.close();
            this.shouldOpen = !this.shouldOpen;
        });

        marker.addListener('mouseover', function () {
            if (this.shouldOpen) infoWindow.open(map, this);   
        });

        marker.addListener('mouseout', function () {
            if (this.shouldOpen) infoWindow.close();  
        });

    } else {
        console.log('Erreur de chargement du restau : ' , status);
    }    
}



/******     Aside with places generate - Reviews - Street View ******/


function buildNewRestoDivInAside(place, status, restoListElt) {
    
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        
        const listDiv    = new HTMLElt('div', 'list', restoListElt, null);
        const streetView = new HTMLElt('div', 'street-view', listDiv.elt, null);
        new google.maps.StreetViewPanorama(
            streetView.elt,
            {
                position: place.geometry.location,
                zoom: 1
            }
        );

        let allReviewsTxt = '';
        place.reviews.forEach(function(review) {
            allReviewsTxt +=  '<p><h4>' + review.author_name + '</h4>';
            allReviewsTxt += '<p>' + displayStars(review.rating) + '</p><br>';
            allReviewsTxt += '<p> Note : ' + review.rating + '</p><br>';
            allReviewsTxt += '<p>' + review.text + '</p></p><br><br>';
        });
        
        const reviewsContainer = new HTMLElt('div', 'reviews-content', listDiv.elt, allReviewsTxt);
        addReviewForm(reviewsContainer.elt);

        
        const infoDiv = new HTMLElt('div', 'info', listDiv.elt, null);

        const placeNameInTitleTxt = '<span class=\'info-div-place-name\'>' + place.name + '</span>';
        const h3 = new HTMLElt('h3', null, infoDiv.elt, placeNameInTitleTxt);

        const description = new HTMLElt('p', null, infoDiv.elt, place.adr_address);
        

        const starBox = new HTMLElt('div', 'starbox', listDiv.elt, displayStars(place.rating));

        const closeStreetViewBtn = new CloseBtn(listDiv.elt, [streetView.elt]);
        const closeReviewsBtn    = new CloseBtn(listDiv.elt, [reviewsContainer.elt]);

        new ShowBtn(listDiv.elt, 'Voir streetView', 'street-view-btn', [streetView.elt, closeStreetViewBtn.elt]);
        new ShowBtn(listDiv.elt, 'Voir les avis', 'show-reviews-btn', [reviewsContainer.elt, closeReviewsBtn.elt]);
    
    } else {
        console.log('Erreur de chargement du restau : ' , status);
    } 
}


/******     HEADER: refresh the map with new position - Filterform: to customise the research by rating  ******/


function initMapWithPosition() {
    const infoWindow = new google.maps.InfoWindow;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const positionUser = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            initMap(positionUser, infoWindow);
        }, function (error) {
            initMap({lat: 46.227, lng: 2.213}, infoWindow, error.message);
        });
    } else {
        initMap({lat: 46.227, lng: 2.213}, infoWindow, 'Service de géolocalisation inéxistant ou désactivé.');
    }
}


let filterform = document.getElementById('filterform');

function filterRating(e){
    
    e.preventDefault();

    const min = document.getElementById('RatingMin').value;
    const max = document.getElementById('RatingMax').value;
    
    if (min <= max && min <= 5 && min >= 1 && max <= 5 && max >=1) {
        
        markersFiltered.forEach(function(marker){
            marker.setMap(map);
        });

        markersFiltered = markers.filter (marker => marker.rating < min || marker.rating > max); 
        
        markersFiltered.forEach(function(marker){
            marker.setMap(null);
        });
    
    } else{
            alert ('erreur');
    }
}
filterform.addEventListener('submit', filterRating);




/******     Add new marker && new place in aside   ******/



function initNewMarkerFormInInfoWindow(infoWindow, latLng) {    
    const htmlForm    = new HTMLElt('form', 'info-window-form', null, null);
    
    const inputName   = new InputForm(htmlForm.elt, 'Nom du resto', 'text', true, 'info-window-form-input');

    const inputRating = new InputForm(htmlForm.elt, 'Note de 1 à 5', 'number', true, 'info-window-form-input');
    inputRating.elt.min = '1';
    inputRating.elt.max = '5';

    const inputSubmit = new InputForm(htmlForm.elt, null, 'submit', 'info-window-form-input');
    inputSubmit.elt.value = 'Valider';

    htmlForm.elt.addEventListener('submit', function(e) {
        e.preventDefault();
        const restoListElt = document.getElementById('list');
        const status = google.maps.places.PlacesServiceStatus.OK;

        if ( !(inputRating.elt.value >= 1 && inputRating.elt.value <= 5) || inputName.elt.value.trim().length < 1 ) {
            alert('Vous devez saisir un nom et une note entre 1 et 5');
            return;
        }

        const place = {
            geometry : {
                location : latLng
            },
            name : inputName.elt.value,
            reviews : [],
            rating : inputRating.elt.value,
        };

        getAddressWithLocation(latLng, place, status, restoListElt);
    });    

    infoWindow.setContent(htmlForm.elt);
}


function getAddressWithLocation(location, place, status, restoListElt) {
    geocoder.geocode({'location': location}, function(results, status) {
        let address;

        if (status === 'OK') {
            if (results[0]) {

                address = results[0].formatted_address;

            } else {
                address = 'Adresse inconnue';
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
            address = 'Adresse inconnue';
        }

        place.adr_address = address;

        buildNewRestoDivInAside(place, status, restoListElt);
    });
}


/******     Create a form in the review aside to add a new review  ******/

function addReviewForm(parentNode){
    const htmlForm      = new HTMLElt('form', 'add-review-form', null, null);
    const txtArea       = new HTMLElt('textarea', 'add-review-textarea', htmlForm.elt, null);
    const inputName     = new InputForm(htmlForm.elt, 'Votre Nom', 'text', true, null);
    const inputRating   = new InputForm(htmlForm.elt, 'Note de 1 à 5', 'number', true, null);
    inputRating.elt.min = '1';
    inputRating.elt.max = '5';
    const inputSubmit = new InputForm(htmlForm.elt, null, 'submit', null);
    inputSubmit.elt.value = 'Valider';

    htmlForm.elt.addEventListener('submit', function(e) {
        e.preventDefault();
    

        if (txtArea.elt.value.trim().length < 10 || inputName.elt.value.trim().length < 1 || !(inputRating.elt.value >= 1 && inputRating.elt.value <= 5) ) {
            alert('Vous devez saisir un commentaire d\'au moins 10 caractères, ainsi que votre nom et une note entre 1 et 5.');
            return;
        }

        let allReviewsTxt = '';      
        allReviewsTxt +=  '<p><h4>' + inputName.elt.value + '</h4>';
        allReviewsTxt += ' <p>'  + displayStars(inputRating.rating) + '</p><br>';
        allReviewsTxt += '<p> Note : ' + inputRating.elt.value + '</p><br>';
        allReviewsTxt += '<p>' + txtArea.elt.value + '</p></p><br><br>';

        this.style.display = 'none';

        parentNode.innerHTML = allReviewsTxt + parentNode.innerHTML;


    });

    parentNode.appendChild(htmlForm.elt);
}
const restauUrl ='http://localhost:8888/Projet%207/ReviewRestau/json/restau.json';
let geocoder;
let map;


function displayStars(rating) {	
	
	let starsTxt = "<fieldset class=\'rating\'>", 
	color, starIcon;

	for (let i = 1; i <= 5; i ++) {
		
		if (i > rating) {			
			
			if ( (i - rating) < 1 && (i - rating) < 0.75 )  {						
			
				starIcon = 'fa-star-half-alt';
				color = 'orange';	
			
			} else {
				starIcon = 'fa-star';
				color = 'silver';
			}
		} else {
		
			starIcon = 'fa-star';
			color = 'orange';
		}
		
		starsTxt += '<i class=\'fas ' + starIcon + '\' style=\'color:' + color + ';\' ></i>'
	}

	starsTxt += '</fieldset>';
	
	return starsTxt;
}

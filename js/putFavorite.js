var isFavorite = document.getElementById("restaurant-favorite-btn").innerHTML;


toggle = () => {

	if(!isFavorite){
		console.log(!isFavorite);
		document.getElementById("restaurant-favorite-btn").innerHTML = "Favorite";
		isFavorite = true;
	}
	else{
		isFavorite = false;
		console.log(isFavorite);
		document.getElementById("restaurant-favorite-btn").innerHTML = "Not Favorite";
	}

	fetchPUTFavorite();
}

fetchPUTFavorite = () => {
	console.log('fetchPUTFavorite');

	formData = new FormData(document.getElementById('review-form-container2'));

	//pairnw to id toy restaurant

	let id = document.getElementById('restaurant-id').innerHTML;

    let url = DBHelper.DATABASE_URL + `/restaurants/${id}/?is_favorite=${isFavorite}`;

    fetch(url, {
      method: 'PUT',
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .catch(e => requestError(e, 'json'))
    .then(response => console.log('Success:', response));

    function requestError(e, part){
      console.log(e);
      const error = (`Request failed with error ${part}`);
      //callback3(error, null);
    }

  };
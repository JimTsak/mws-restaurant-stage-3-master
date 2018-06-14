
getIDfromURL = () => {
	var id = document.getElementById('restaurant_id');
 	id.value = "some text";
 	console.log('1111111');
};


fetchPOSTReview = () => {
	console.log('fetchPOSTReview');

	formData = new FormData(document.getElementById('review-form-container2'));

	//pairnw to id toy restaurant

	let id = document.getElementById('restaurant-id').innerHTML;

	formData.append("restaurant_id", id);


	var object = {};

	formData.forEach(function(value, key){
    	object[key] = value;
	});

    let url = DBHelper.DATABASE_URL + "/reviews";

    fetch(url, {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(object), // data can be `string` or {object}!
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .catch(e => requestError(e, 'json'))
    .then(response => {console.log('Success:', response); alert('Your review was succesfully sent')});



    function requestError(e, part){
      console.log(e);
      const error = (`Request failed with error ${part}`);
      alert(`Request failed with error ${part}`);
    }

  };
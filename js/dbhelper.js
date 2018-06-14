/**
 * Common database helper functions.
 */

class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // 8000 Change this to your server port

    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants.
   */

  static fetchRestaurants(callback) {

    let url = DBHelper.DATABASE_URL + "/restaurants";
    console.log('fetchRestaurants');
    fetch(url)
    .then(response => response.json())
    .then(addRestaurants)
    .catch(e => requestError(e, 'json'));


    function addRestaurants(data){
      const restaurants = data;
      console.log(restaurants);
      //orismos writeDatabase(data, store)
      DBHelper.writeDatabase(restaurants, "restaurants");
      callback(null, restaurants);
    }

    function requestError(e, part){
      console.log(e);
      const error = (`Request failed with error ${part}`);
      callback(error, null);
    }

  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch reviews for a specific restaurant id with proper error handling.
   */
  static fetchReviewsByRestaurantId(id, callback2) {
    // Fetch all reviews
    console.log("fetchReviewsByRestaurantId");

    let url = DBHelper.DATABASE_URL + `/reviews/?restaurant_id=` + id;
    console.log(url);

    fetch(url)
    .then(response => response.json())
    .then(addReviews)
    .catch(e => requestError(e, 'json'));


    function addReviews(data){
      const reviews = data;
      //orismos writeDatabase(data, store)
      DBHelper.writeDatabase(reviews, "reviews");
      callback2(null, reviews);
    }

    function requestError(e, part){
      console.log(e);
      const error = (`Request failed with error ${part}`);
      callback2(error, null);
    }
  }


  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }


  static registerServiceWorker() {

    //make sure that Service Workers are supported.
    if (navigator.serviceWorker) {

      navigator.serviceWorker
          .register('/sw.js')
          .then(function (registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          })
          .catch(function (err) {
            // registration failed
            console.log('ServiceWorker registration failed: ', err);
          });
    }
    else {

      console.log('Service Worker is not supported in this browser.');
    }
  }

  //IndexedDB Promised
  static openDatabase() {
    // If the browser doesn't support service worker,
    // we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
    console.log("openDatabase");

    var dbPromise = idb.open('restaurant', 1, upgradeDb => {

    switch(upgradeDb.oldVersion) {
    case 0:
        var restaurantsStore =  upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
        var reviewsStore =  upgradeDb.createObjectStore('reviews', { keyPath: 'id' });
      }
    });

    return dbPromise;

  }


  static writeDatabase(data, store) {

    console.log("writeDatabase");

    var myData = data;
    var myStore = store;
    var dbPromise = this.openDatabase();

    dbPromise.then(function(db){
      if (!db) return;

      const tx = db.transaction(myStore, 'readwrite');
      const store = tx.objectStore(myStore);


      myData.forEach(function(record) {
        store.put({id: record.id, data: record});
      });

    });

  }


  static getFromDatabase() {
    console.log("GETFromDatabase");

    var dbPromise = this.openDatabase();

    dbPromise.then(db => {
      return db.transaction('restaurants').objectStore('restaurants').getAll();
    }).then(allObjs => console.log(allObjs));

  }

}

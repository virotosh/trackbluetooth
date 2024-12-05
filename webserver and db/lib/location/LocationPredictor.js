const LocationProvider = require('./provider/LocationProvider')
const Location = require('./Location')

class LocationPredictor extends LocationProvider{
  /**
   * Locations that the prediction will be based on.
   *
   * Note: must be sorted by {@link Location#timestamp} (ascending, oldest location first).
   */
  constructor () {
    super();
    this.recentLocations = [];
    this.predictedLocation = new Location();
    this.shouldUpdatePrediction = true;
    /**
     * The amount of milliseconds that the predictor will 'look into the future'. A value of 2000
     * will result in predictions of the location in 2 seconds from now.
     */
    this.predictionDuration = 1; // in Millis
    /**
     * The amount of milliseconds that the predictor will 'look into the past'. A value of 2000 will
     * result in predictions based on locations from the past 2 seconds.
     */
    this.recentLocationDuration = 3; // in Millis
  }

  getLocation() {
    //if (this.shouldUpdatePrediction) {
      this.predict();
    //}
    return this.predictedLocation;
  }

  invalidatePrediction() {
    this.shouldUpdatePrediction = true;
  }

  addLocation(location) {
    this.recentLocations.push(location);
    this.removeOldLocations();
    this.invalidatePrediction();
  }

  removeOldLocations() {
    var oldLocations = [];
    var minimumTimestamp = new Date().getTime() - this.recentLocationDuration;
    var location = new Location();
    for (var i = 0; i < this.recentLocations.length; i++) {
      location = this.recentLocations[i];
      if (location.getTimestamp() < minimumTimestamp) {
        oldLocations.push(location);
      } else {
        break;
      }
    }

    this.recentLocations = this.recentLocations.filter( ( el ) => !oldLocations.includes( el ) );
    //recentLocations.removeAll(oldLocations);
  }

  /**
     * Will predict the location after the specified predictionDuration by looking at the specified
     * recent locations.
     *
     * @param locations the recent locations
     * @param duration  amount of milliseconds to look into the future
     */
  predict(locations = this.recentLocations, duration = this.predictionDuration) {
    if (locations.length == 0) {
      this.predictedLocation = null;
    }

    var lastLocation = locations.get(locations.length - 1);
    if (locations.length == 1) {
      var predictedLocation = new Location(lastLocation.latitude, lastLocation.longitude, lastLocation.altitude, lastLocation.elevation);
      predictedLocation.setTimestamp(lastLocation.getTimestamp() + duration);
      this.predictedLocation = predictedLocation;
    }

    var angle = (new AngleUtil()).calculateMeanAngle(locations);
    var speed = this.calculateSpeed(locations);
    var distance = speed * duration;

    var predictedLocation = new Location(lastLocation.latitude, lastLocation.longitude, lastLocation.altitude, lastLocation.elevation);
    predictedLocation.setTimestamp(lastLocation.getTimestamp() + duration);
    this.predictedLocation = predictedLocation.getShiftedLocation(distance, angle);
    this.shouldUpdatePrediction = false;
  }

  /**
   * Calculates the speed in meters per second.
   */
  calculateSpeed(locations) {
    if (locations.length < 2) {
      return 0;
    }
    var originLocation = locations[0];
    var currentLocation = locations[locations.length - 1];
    if (!originLocation.hasLatitudeAndLongitude() || !currentLocation.hasLatitudeAndLongitude()) {
      return 0;
    }
    var duration = Math.abs(currentLocation.getTimestamp() - originLocation.getTimestamp());
    var distance = originLocation.getDistanceTo(currentLocation);
    return duration > 0 ? (distance / duration) : 0;
  }

  /*
      Getter & Setter
   */

  getRecentLocations() {
    return this.recentLocations;
  }

  setRecentLocations(recentLocations) {
    this.recentLocations = recentLocations;
    //this.invalidatePrediction();
  }

  getPredictionDuration() {
    return this.predictionDuration;
  }

  setPredictionDuration(predictionDuration) {
    this.predictionDuration = predictionDuration;
    //this.invalidatePrediction();
  }
}

module.exports = LocationPredictor;

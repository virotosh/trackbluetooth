const LocationPredictor = require('./lib/location/LocationPredictor')
const LocationProvider = require('./lib/location/provider/LocationProvider')
const LocationUtil = require('./lib/location/LocationUtil')
const DistanceUtil = require('./lib/location/distance/DistanceUtil')
const Multilateration = require('./Multilateration')

class IndoorPositioning extends LocationProvider { // extends BeaconUpdateListener
  constructor () {
    super();
    this.UPDATE_INTERVAL_IMMEDIATE = 50;
    this.UPDATE_INTERVAL_FAST = 100;
    this.UPDATE_INTERVAL_MEDIUM = 500;
    this.UPDATE_INTERVAL_SLOW = 3000;

    this.ROOT_MEAN_SQUARE_THRESHOLD_STRICT = 5;
    this.ROOT_MEAN_SQUARE_THRESHOLD_MEDIUM = 10;
    this.ROOT_MEAN_SQUARE_THRESHOLD_LIGHT = 25;

    this.MINIMUM_BEACON_COUNT = 3; // multilateration requires at least 3 beacons
    this.MAXIMUM_BEACON_COUNT = 10;

    this.MAXIMUM_MOVEMENT_SPEED_NOT_SET = -1;
    this.maximumMovementSpeed = this.MAXIMUM_MOVEMENT_SPEED_NOT_SET;
    this.rootMeanSquareThreshold = this.ROOT_MEAN_SQUARE_THRESHOLD_LIGHT;
    this.minimumRssiThreshold = -70;

    this.lastKnownLocation = null;
    this.maximumLocationUpdateInterval = this.UPDATE_INTERVAL_MEDIUM;
    this.locationListeners = []
    this.indoorPositioningBeaconFilter = null;
    //this.usableIndoorPositioningBeaconFilter = this.createUsableIndoorPositioningBeaconFilter();
    this.locationPredictor = new LocationPredictor();
    // this.beaconManager = beaconManager;
    //this.beaconManager.registerBeaconUpdateListener(this);
    this.usableBeacons = null;
  }

  getLocation() {
    return this.lastKnownLocation;
  }

  getMeanLocation(amount) {
    return (new LocationUtil).calculateMeanLocationFromLast(this.locationPredictor.getRecentLocations(), amount);
  }

  onBeaconUpdated(beacon) {
    if (this.shouldUpdateLocation()) {
      this.updateLocation();
    }
  }

  updateLocation(usableBeacons) {
    // var usableBeacons = [];
    //   // TESTS
    // for (var k in this.beaconManager.beaconMap){
    //   var beacon = this.beaconManager.beaconMap[k]
    //   if (beacon.macAddress=='c9eeac1cd377' && beacon.beaconType == 'eddystoneUid'){
    //     usableBeacons.push(beacon);
    //     console.log(beacon.station + ', ' +beacon.getDistance());
    //   }
    // }
    this.usableBeacons = usableBeacons;
    if (this.usableBeacons.length < this.MINIMUM_BEACON_COUNT) {
      return;
    } else if (this.usableBeacons.length > this.MINIMUM_BEACON_COUNT) {
      // WHY sorting?
      // Collections.sort(usableBeacons, BeaconUtil.DescendingRssiComparator);
      // Sort homes by rssi in ascending order:
      // usableBeacons.sort((a, b) => (a.rssi - b.rssi));
      this.usableBeacons.sort((a, b) => (b.getFilteredRssi() - a.getFilteredRssi()));
      // console.log(usableBeacons)
      var maximumBeaconIndex = Math.min(this.MAXIMUM_BEACON_COUNT, this.usableBeacons.length);
      var firstRemovableBeaconIndex = maximumBeaconIndex;
      for (var beaconIndex = this.MINIMUM_BEACON_COUNT; beaconIndex < maximumBeaconIndex; beaconIndex++) {
        if (this.usableBeacons[beaconIndex].getFilteredRssi() < this.minimumRssiThreshold) {
        // if (this.usableBeacons[beaconIndex].getFilteredRssi() < -90) {
          // console.log(this.usableBeacons[beaconIndex].getFilteredRssi())
          firstRemovableBeaconIndex = beaconIndex;
          break;
        }
      }
      // check this remove beacon with minimumRssiThreshold
      //usableBeacons.subList(firstRemovableBeaconIndex, usableBeacons.size()).clear();
      // this.usableBeacons= this.usableBeacons.slice(firstRemovableBeaconIndex, this.usableBeacons.length);
      this.usableBeacons= this.usableBeacons.slice(0, firstRemovableBeaconIndex);
    }
    // console.log(this.usableBeacons.length)

    var multilateration = new Multilateration(this.usableBeacons);
    try {
      var location = multilateration.getLocation();
      // console.log(multilateration.getRMS());
      // The root mean square of multilateration `is used to filter out inaccurate locations.
      // Adjust value to allow location updates with higher deviation
      //console.log(multilateration.getRMS() + ', '+this.rootMeanSquareThreshold)
      if (multilateration.getRMS() < this.rootMeanSquareThreshold) {
        //console.log('aaaa')
        this.locationPredictor.addLocation(location);
        this.onLocationUpdated(location);
      }
    } catch (err) {
      // check this, it gives some errors.
      // console.log(err)

    }
  }

  getUsableBeacons(availableBeacons) {
    // Check this
    // var beaconFilter = this.usableIndoorPositioningBeaconFilter;
    // if (availableBeacons.length!=0 || !beaconFilter.canMatch(availableBeacons.iterator().next())) {
    //   return new ArrayList<>();
    // }
    // return beaconFilter.getMatches(availableBeacons);
  }

  onLocationUpdated(location) {
    if (this.maximumMovementSpeed != this.MAXIMUM_MOVEMENT_SPEED_NOT_SET && this.lastKnownLocation != null) {
      location = (new DistanceUtil).speedFilter(lastKnownLocation, location, maximumMovementSpeed);
    }
    this.lastKnownLocation = location;
    for (var i =0; i<this.locationListeners.length; i++){
      var locationListener = this.locationListeners[i];
      locationListener.onLocationUpdated(this, this.lastKnownLocation)
    }
  }

  shouldUpdateLocation() {
    if (this.lastKnownLocation == null) {
      return true;
    }
    return this.lastKnownLocation.getTimestamp() < new Date().getTime() - this.maximumLocationUpdateInterval;
  }

  registerLocationListener(locationListener) {
    return this.locationListeners.push(locationListener);
  }

  unregisterLocationListener(locationListener) {
    //return this.locationListeners.remove(locationListener);
  }

  // public static GenericBeaconFilter<? extends Beacon> createUsableIndoorPositioningBeaconFilter() {
  //     return new GenericBeaconFilter<Beacon>() {
  //
  //         @Override
  //         public boolean matches(Beacon beacon) {
  //             BeaconFilter beaconFilter = getInstance().indoorPositioningBeaconFilter;
  //             if (beaconFilter != null) {
  //                 if (!beaconFilter.canMatch(beacon)) {
  //                     return false;
  //                 }
  //                 if (!beaconFilter.matches(beacon)) {
  //                     return false;
  //                 }
  //             }
  //             if (!beacon.hasLocation()) {
  //                 return false; // beacon has no location assigned, can't use it for multilateration
  //             }
  //             if (!beacon.hasBeenSeenInThePast(2, TimeUnit.SECONDS)) {
  //                 return false; // beacon hasn't been in range recently, avoid using outdated data
  //             }
  //             return true;
  //         }
  //
  //     };
  // }

  /*
      Getter & Setter
   */

  getMaximumMovementSpeed() {
    return this.maximumMovementSpeed;
  }

  setMaximumMovementSpeed(maximumMovementSpeed) {
    this.maximumMovementSpeed = maximumMovementSpeed;
  }

  getMaximumLocationUpdateInterval() {
    return this.maximumLocationUpdateInterval;
  }

  setMaximumLocationUpdateInterval(maximumLocationUpdateInterval) {
    this.maximumLocationUpdateInterval = maximumLocationUpdateInterval;
  }

  getLocationPredictor() {
    return this.locationPredictor;
  }

  setLocationPredictor(locationPredictor) {
    this.locationPredictor = locationPredictor;
  }

  getIndoorPositioningBeaconFilter() {
    //return this.indoorPositioningBeaconFilter;
  }

  setIndoorPositioningBeaconFilter(indoorPositioningBeaconFilter) {
    this.indoorPositioningBeaconFilter = indoorPositioningBeaconFilter;
  }

  getUsableIndoorPositioningBeaconFilter() {
    return this.usableIndoorPositioningBeaconFilter;
  }

  setUsableIndoorPositioningBeaconFilter(usableIndoorPositioningBeaconFilter) {
    this.usableIndoorPositioningBeaconFilter = usableIndoorPositioningBeaconFilter;
  }

  setRootMeanSquareThreshold( rootMeanSquareThreshold) {
    this.rootMeanSquareThreshold = rootMeanSquareThreshold;
  }

  getRootMeanSquareThreshold() {
    return this.rootMeanSquareThreshold;
  }

  getMinimumRssiThreshold() {
    return this.minimumRssiThreshold;
  }

  setMinimumRssiThreshold( minimumRssiThreshold) {
    this.minimumRssiThreshold = minimumRssiThreshold;
  }

}

module.exports = IndoorPositioning;

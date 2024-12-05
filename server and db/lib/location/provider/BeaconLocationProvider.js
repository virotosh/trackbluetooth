const LocationProvider = require('./LocationProvider')
class BeaconLocationProvider extends LocationProvider{
  constructor(beacon){
    super(beacon);
    this.beacon = beacon;
    this.location = null;
  }
  updateLocation(beaconLocation = null) {
    this.location = beaconLocation;
  }
  shouldUpdateLocation() {
    return this.location == null;
  }

  canUpdateLocation(){
    //return false;
    return true;
  }

  getLocation(){
    if (this.shouldUpdateLocation() && this.canUpdateLocation()) {
      this.updateLocation();
    }
    return this.location;
  }

  hasLocation() {
    var location = this.getLocation();
    return location != null && location.hasLatitudeAndLongitude();
  }
}

module.exports = BeaconLocationProvider;

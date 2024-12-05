const Beacon = require('./Beacon')
const EddystoneLocationProvider = require('../../location/provider/EddystoneLocationProvider')
const BeaconDistanceCalculator = require('../../location/distance/BeaconDistanceCalculator')
class Eddystone extends Beacon {
  constructor () {
    super()
    this.CALIBRATION_DISTANCE_DEFAULT = 0;
    this.calibratedDistance = this.CALIBRATION_DISTANCE_DEFAULT;
    this.beaconType = '';
    this.station = '';
  }
  createLocationProvider() {
    return new EddystoneLocationProvider(this);
  }

  applyPropertiesFromAdvertisingPacket(advertisingPacket) {
    super.applyPropertiesFromAdvertisingPacket(advertisingPacket);
    this.station = advertisingPacket.data.station;
    if ('eddystoneUrl' in advertisingPacket.data){
      this.calibratedRssi = advertisingPacket.data.eddystoneUrl.txPower;
      this.beaconType = 'eddystoneUrl';
    }
    if ('eddystoneUid' in advertisingPacket.data){
      // this.calibratedRssi = -31;
      this.calibratedRssi = advertisingPacket.data.eddystoneUid.txPower 
      this.beaconType = 'eddystoneUid'
    }
  }

  getDistance() {
    //console.log(this.shouldUpdateDistance)
    // if (this.shouldUpdateDistance) {
      var filteredRssi = this.createSuggestedWindowFilter().filter(this);
      var distance = new BeaconDistanceCalculator().calculateDistanceTo(this, filteredRssi);
      // if (this.macAddress == 'c9eeac1cd377' && this.beaconType == 'eddystoneUid')
      //    console.log(filteredRssi+' : '+distance + " : " +this.station);
    //   this.shouldUpdateDistance = false;
    // }
    return distance;

    // TODO get real device elevation with 3D multilateration
  }
}

module.exports = Eddystone;

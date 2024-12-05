const Beacon = require('./Beacon')
const IBeaconLocationProvider = require('../../location/provider/IBeaconLocationProvider')
const BeaconDistanceCalculator = require('../../location/distance/BeaconDistanceCalculator')
class IBeacon extends Beacon {
  constructor () {
    super()
    this.CALIBRATION_DISTANCE_DEFAULT = 1;
    this.calibratedDistance = this.CALIBRATION_DISTANCE_DEFAULT;
    this.proximityUuid = null;
    this.major = null;
    this.minor = null;
  }
  createLocationProvider() {
    return new IBeaconLocationProvider(this);
  }

  applyPropertiesFromAdvertisingPacket(advertisingPacket) {
    super.applyPropertiesFromAdvertisingPacket(advertisingPacket);
    this.setProximityUuid(advertisingPacket.getProximityUuid());
    this.setMajor(advertisingPacket.getMajor());
    this.setMinor(advertisingPacket.getMinor());
    // console.log(advertisingPacket.getMeasuredPowerByte());
    this.setCalibratedRssi(advertisingPacket.getMeasuredPowerByte());
    // console.log(this.getCalibratedRssi());
  }

  toString() {
    return "IBeacon{" +
            "proximityUuid=" + this.proximityUuid +
            ", major=" + this.major +
            ", minor=" + this.minor +
            ", macAddress='" + this.macAddress + '\'' +
            ", rssi=" + this.rssi +
            ", calibratedRssi=" + this.calibratedRssi +
            ", transmissionPower=" + this.transmissionPower +
            ", advertisingPackets=" + this.advertisingPackets +
            '}';
  }

  getDistance() {
    if (this.shouldUpdateDistance) {
      var filteredRssi = this.createSuggestedWindowFilter().filter(this);
      var distance = new BeaconDistanceCalculator().calculateDistanceTo(this, filteredRssi);
      console.log('BeaconDistanceCalculator: '+distance)
      this.shouldUpdateDistance = false;
    }
    return distance;

    // TODO get real device elevation with 3D multilateration
  }

  /*
      Getter & Setter
   */

  getProximityUuid() {
    return this.proximityUuid;
  }

  setProximityUuid(proximityUuid) {
    this.proximityUuid = proximityUuid;
  }

  getMajor() {
    return this.major;
  }

  setMajor(major) {
    this.major = major;
  }

  getMinor() {
    return this.minor;
  }

  setMinor(minor) {
    this.minor = minor;
  }
}

module.exports = IBeacon;

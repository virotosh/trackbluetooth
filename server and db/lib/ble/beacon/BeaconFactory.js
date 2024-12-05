const IBeaconAdvertisingPacket = require('../advertising/IBeaconAdvertisingPacket')
const EddystoneAdvertisingPacket = require('../advertising/EddystoneAdvertisingPacket')
const IBeacon = require('./IBeacon')
const Eddystone = require('./Eddystone')
const Beacon = require('./Beacon')
class BeaconFactory {
  /**
   * Holds a mapping of {@link AdvertisingPacket} classes to {@link Beacon} classes.
   */
  constructor () {
    this.beaconClasses = {};
    this.beaconClasses[IBeaconAdvertisingPacket.name] = IBeacon.name;
    this.beaconClasses[EddystoneAdvertisingPacket.name] = Eddystone.name;
  }
  /**
   * Will create a new instance of a class extending {@link Beacon} that matches the specified
   * {@link AdvertisingPacket}.
   *
   * @param advertisingPacket one of the advertising packets that the desired beacon advertised
   */
  createBeacon(advertisingPacket) {
    var beaconClass = this.getBeaconClass(advertisingPacket);
    //console.log(beaconClass);
    if (beaconClass == null) {
      return null;
    }
    // NEED TO REVISED
    if (beaconClass == 'Eddystone'){
      return new Eddystone();
    } else if (beaconClass == 'IBeacon'){
      return new IBeacon();
    }
    return new Beacon();
  }

  /**
   * Will perform a lookup in the {@link #beaconClasses} map.
   */
  getBeaconClass(advertisingPacket) {
    return this.beaconClasses[advertisingPacket.constructor.name];
  }

  /**
   * Will update the {@link #beaconClasses} map.
   */
  addBeaconClass(advertisingPacketClass, beaconClass) {
    beaconClasses[advertisingPacketClass] = beaconClass;
  }

  /*
      Getter & Setter
   */

  getBeaconClasses() {
    return this.beaconClasses;
  }

  setBeaconClasses(beaconClasses) {
    this.beaconClasses = beaconClasses;
  }
}

module.exports = BeaconFactory;

const AdvertisingPacketFactoryManager = require('../advertising/AdvertisingPacketFactoryManager');
const BeaconFactory = require('./BeaconFactory');
const MeanFilter = require('./signal/MeanFilter')
class BeaconManager {
  constructor () {
    this.beaconFactory = new BeaconFactory();
    this.advertisingPacketFactoryManager = new AdvertisingPacketFactoryManager();
    this.beaconMap = {};
    this.beaconUpdateListeners = [];
    this.inactivityDuration = 10000; // in Millis
    this.closestBeacon = null;
    this.meanFilter = new MeanFilter(15);
    //this.instance = null;
  }
  //private static volatile BeaconManager instance;

  // getInstance() {
  //   // if (this.instance == null) {
  //   //   this.instance = new BeaconManager();
  //   // }
  //   // return this.instance;
  //   return this;
  // }

  processAdvertisingData(macAddress, advertisingData, rssi) {
    var advertisingPacket = this.advertisingPacketFactoryManager.createAdvertisingPacket(advertisingData);
    if (advertisingPacket != null) {
      advertisingPacket.setRssi(rssi);
    }
    return this.processAdvertisingPacket(macAddress, advertisingPacket);
  }

  processAdvertisingPacket(macAddress, advertisingPacket) {
    if (advertisingPacket == null) {
        return null;
    }
    var instance = this;
    var key = this.getBeaconKey(macAddress, advertisingPacket);
    var beacon;
    this.removeInactiveBeacons();
    if (key in instance.beaconMap) {
      beacon = instance.beaconMap[key];
    } else {
      //this.removeInactiveBeacons();
      beacon = instance.beaconFactory.createBeacon(advertisingPacket);
      if (beacon == null) {
          return advertisingPacket;
      }
      beacon.setMacAddress(macAddress);
      beacon.setRssi(advertisingPacket.getRssi());
      instance.beaconMap[key] = beacon;
    }
    beacon.addAdvertisingPacket(advertisingPacket);
    //console.log(beacon)
    //console.log(advertisingPacket)
    //TODO move outside method
    this.processClosestBeacon(beacon);
    instance.notifyBeaconUpdateListeners(beacon);
    return advertisingPacket;
  }

  processClosestBeacon(beacon) {
    // this.instance = this.getInstance();

    this.meanFilter.setMaximumTimestamp(beacon.getLatestAdvertisingPacket().getTimestamp());
    //console.log(this.meanFilter.getDuration());
    //console.log(beacon.getLatestAdvertisingPacket().getTimestamp());
    this.meanFilter.setMinimumTimestamp(beacon.getLatestAdvertisingPacket().getTimestamp() - this.meanFilter.getDuration());

    if (this.closestBeacon == null) {
      this.closestBeacon = beacon;
    } else {
      if (this.closestBeacon != beacon) {
        //console.log(beacon.getDistance(this.meanFilter))
        //if (beacon.getDistance(this.meanFilter) + 1 < this.closestBeacon.getDistance(this.meanFilter)) {
        if (beacon.getDistance() + 1 < this.closestBeacon.getDistance()) {
          this.setClosestBeacon(beacon);
        }
      }
    }
  }

  notifyBeaconUpdateListeners(beacon) {
    //console.log(this.instance)
    this.beaconUpdateListeners.forEach(function (beaconUpdateListener) {
    //for (var beaconUpdateListener in this.beaconUpdateListeners) {
      //console.log(beacon);
      beaconUpdateListener.onBeaconUpdated(beacon);
    });
  }

  registerBeaconUpdateListener(beaconUpdateListener) {
    return this.beaconUpdateListeners.push(beaconUpdateListener);
  }

  unregisterBeaconUpdateListener(beaconUpdateListener) {
    // var index = this.getInstance().beaconUpdateListeners.indexOf(beaconUpdateListener);
    // if (index >= 0) {
    //   this.getInstance().beaconUpdateListeners.splice( index, 1 );
    // }
    return this.beaconUpdateListeners.remove(beaconUpdateListener);
  }

  getBeaconKey(macAddress, advertisingPacket) {
    return macAddress + "-" + advertisingPacket.toString();
  }

  getBeacon(macAddress, advertisingPacket) {
    var key = this.getBeaconKey(macAddress, advertisingPacket);
    return this.beaconMap[key];
  }

  removeInactiveBeacons() {
    var minimumAdvertisingTimestamp = new Date().getTime() - this.inactivityDuration;
    var instance = this;
    var latestAdvertisingPacket;
    var inactiveBeaconKeys = [];
    for (var key in this.beaconMap) {
      var beaconEntry = this.beaconMap[key];
      latestAdvertisingPacket = beaconEntry.getLatestAdvertisingPacket();
      if (latestAdvertisingPacket == null || latestAdvertisingPacket.getTimestamp() < minimumAdvertisingTimestamp) {
        inactiveBeaconKeys.push(key);
      }
    }
    for (var i=0; i<inactiveBeaconKeys.length; i++){
      delete instance.beaconMap[inactiveBeaconKeys[i]];
    }
  }

  /*
      Getter & Setter
   */

  getClosestBeacon() {
    return this.closestBeacon;
  }

  setClosestBeacon(closestBeacon) {
    this.closestBeacon = closestBeacon;
  }

  getBeaconFactory() {
    return this.beaconFactory;
  }

  setBeaconFactory(beaconFactory) {
    this.beaconFactory = beaconFactory;
  }

  getAdvertisingPacketFactoryManager() {
    return this.advertisingPacketFactoryManager;
  }

  setAdvertisingPacketFactoryManager(advertisingPacketFactoryManager) {
    this.advertisingPacketFactoryManager = advertisingPacketFactoryManager;
  }

  getBeaconMap() {
    return this.beaconMap;
  }

  getInactivityDuration() {
    return this.inactivityDuration;
  }

  setInactivityDuration(inactivityDuration) {
    this.inactivityDuration = inactivityDuration;
  }
}

module.exports = BeaconManager;

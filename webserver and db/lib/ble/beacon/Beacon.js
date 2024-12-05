const AdvertisingPacketUtil = require('../advertising/AdvertisingPacketUtil')
// const BeaconDistanceCalculator = require('../../location/distance/BeaconDistanceCalculator')
const BeaconUtil = require('./BeaconUtil')
const KalmanFilter = require('./signal/KalmanFilter')
class Beacon {
  constructor(){
    this.macAddress = '';
    this.rssi = 0; // in dBm
    this.calibratedRssi = 0; // in dBm
    this.calibratedDistance = 0.0; // in m
    this.transmissionPower = 0; // in dBm
    this.distance = 0.0; // in m
    this.shouldUpdateDistance = true;
    this.advertisingPackets = [];
    this.MAXIMUM_PACKET_AGE = 15000; // in Millis something like 60
    this.locationProvider = null;
    //this.locationProvider = this.createLocationProvider();
  }

    // /**
    //  * @deprecated use a {@link BeaconFactory} instead (e.g. in {@link BeaconManager#beaconFactory}).
    //  */
    // @Deprecated
    // public static Beacon from(AdvertisingPacket advertisingPacket) {
    //     Beacon beacon = null;
    //     if (advertisingPacket instanceof IBeaconAdvertisingPacket) {
    //         beacon = new IBeacon();
    //     } else if (advertisingPacket instanceof EddystoneAdvertisingPacket) {
    //         beacon = new Eddystone();
    //     }
    //     return beacon;
    // }
    //
  hasLocation() {
    return this.locationProvider != null && this.locationProvider.hasLocation();
  }

  getLocation() {
    return this.locationProvider == null ? null : this.locationProvider.getLocation();
  }

  getLocations(beacons) {
    var locations = [];
    beacons.forEach(function (beacon) {
    //for (var beacon in beacons) {
      if (beacon.hasLocation()) {
        locations.push(beacon.getLocation());
      }
    });
    return locations;
  }

  createLocationProvider(){

  }

  hasAnyAdvertisingPacket() {
    return !(this.advertisingPackets.length == 0);
  }

  getOldestAdvertisingPacket() {
    if (!this.hasAnyAdvertisingPacket()) {
      return null;
    }
    return this.advertisingPackets[0];
  }

  getLatestAdvertisingPacket() {
    if (!this.hasAnyAdvertisingPacket()) {
      return null;
    }
    return this.advertisingPackets[this.advertisingPackets.length - 1];
  }

  /**
   * Returns an ArrayList of AdvertisingPackets that have been received in the specified time
   * range. If no packets match, an empty list will be returned.
   *
   * @param startTimestamp minimum timestamp, inclusive
   * @param endTimestamp   maximum timestamp, exclusive
   */
  getAdvertisingPacketsBetween(startTimestamp, endTimestamp) {
    //console.log('advertisingPackets: '+ this.advertisingPackets.length)
    return (new AdvertisingPacketUtil).getAdvertisingPacketsBetween(this.advertisingPackets, startTimestamp, endTimestamp);
  }

  getAdvertisingPacketsFromLast(amount) {
    return getAdvertisingPacketsBetween((new Date().getTime()) - amount, new Date().getTime());
  }

  getAdvertisingPacketsSince(timestamp) {
    return this.getAdvertisingPacketsBetween(timestamp, new Date().getTime());
  }

  getAdvertisingPacketsBefore(timestamp) {
    return this.getAdvertisingPacketsBetween(0, timestamp);
  }

  addAdvertisingPacket(advertisingPacket) {
    var rssi = advertisingPacket.getRssi();

    var latestAdvertisingPacket = this.getLatestAdvertisingPacket();
    //console.log('latestAdvertisingPacket' + latestAdvertisingPacket.getTimestamp() > advertisingPacket.getTimestamp())
    if (latestAdvertisingPacket == null || !advertisingPacket.dataEquals(latestAdvertisingPacket)) {
      this.applyPropertiesFromAdvertisingPacket(advertisingPacket);
    }

    if (latestAdvertisingPacket != null && latestAdvertisingPacket.getTimestamp() > advertisingPacket.getTimestamp()) {
      //console.log('latestAdvertisingPacket' + latestAdvertisingPacket.getTimestamp() > advertisingPacket.getTimestamp())
      return;
    }

    this.advertisingPackets.push(advertisingPacket);
    this.trimAdvertisingPackets();
    this.invalidateDistance();
  }

  applyPropertiesFromAdvertisingPacket(advertisingPacket) {
      //setTransmissionPower(lastAdvertisingPacket.get);
  }

  trimAdvertisingPackets() {
    if (!this.hasAnyAdvertisingPacket()) {
        return;
    }
    var removableAdvertisingPackets = [];
    var latestAdvertisingPacket = this.getLatestAdvertisingPacket();
    var minimumPacketTimestamp = new Date().getTime() - this.MAXIMUM_PACKET_AGE;
    for (var i=0; i<this.advertisingPackets.length; i++){
      var advertisingPacket = this.advertisingPackets[i]
      //for (var advertisingPacket in advertisingPackets) {
      if (advertisingPacket == latestAdvertisingPacket) {
        // don't remove the latest packet
        continue;
      }
      if (advertisingPacket.getTimestamp() < minimumPacketTimestamp) {
        // mark old packets as removable
        removableAdvertisingPackets.push(advertisingPacket);
      }
    }
    this.advertisingPackets = this.advertisingPackets.filter( ( el ) => !removableAdvertisingPackets.includes( el ) );
  }

  equalsLastAdvertisingPackage(advertisingPacket) {
    return this.hasAnyAdvertisingPacket() && this.getLatestAdvertisingPacket() == advertisingPacket;
  }

  hasBeenSeenSince(timestamp) {
    if (!this.hasAnyAdvertisingPacket()) {
        return false;
    }
    return this.getLatestAdvertisingPacket().getTimestamp() > timestamp;
  }

  hasBeenSeenInThePast(duration) {
    if (!this.hasAnyAdvertisingPacket()) {
      return false;
    }
    return this.getLatestAdvertisingPacket().getTimestamp() > new Date().getTime() - duration;
  }

  getRssiFilter(filter) {
    return filter.filter(this);
  }

  getFilteredRssi() {
    // console.log(this.getRssiFilter(this.createSuggestedWindowFilter()));
    return this.getRssiFilter(this.createSuggestedWindowFilter());
  }

  invalidateDistance() {
      this.shouldUpdateDistance = true;
  }

  // getDistance() {
  //   console.log(this.shouldUpdateDistance)
  //   if (this.shouldUpdateDistance) {
  //     var distance = this.getDistance(this.createSuggestedWindowFilter());
  //     this.shouldUpdateDistance = false;
  //   }
  //   return distance;
  // }

  // getDistance(filter) {
  //   var filteredRssi = this.getRssi(filter);
  //   // TODO get real device elevation with 3D multilateration
  //   //return BeaconDistanceCalculator.calculateDistanceWithoutElevationDeltaToDevice(this, filteredRssi, 1);
  //   return (new BeaconDistanceCalculator).calculateDistanceTo(this, filteredRssi);
  // }

  getEstimatedAdvertisingRange() {
    return new BeaconUtil.getAdvertisingRange(this.transmissionPower);
  }

  getLatestTimestamp() {
    if (!this.hasAnyAdvertisingPacket()) {
      return 0;
    }
    return this.getLatestAdvertisingPacket().getTimestamp();
  }

  createSuggestedWindowFilter() {
    return new KalmanFilter(this.getLatestTimestamp());
  }

  /**
   * This function and its reverse are implemented with indicative naming in BeaconUtil.
   *
   * @deprecated use {@link BeaconUtil#AscendingRssiComparator} instead
   */
  // @Deprecated
  // public static Comparator<Beacon> RssiComparator = new Comparator<Beacon>() {
  //     public int compare(Beacon firstBeacon, Beacon secondBeacon) {
  //         if (firstBeacon.equals(secondBeacon)) {
  //             return 0;
  //         }
  //         return Integer.compare(firstBeacon.rssi, secondBeacon.rssi);
  //     }
  // };

  toString() {
      return "Beacon{" +
              ", macAddress='" + this.macAddress + '\'' +
              ", rssi=" + this.rssi +
              ", calibratedRssi=" + this.calibratedRssi +
              ", calibratedDistance=" + this.calibratedDistance +
              ", transmissionPower=" + this.transmissionPower +
              ", advertisingPackets=" + this.advertisingPackets +
              '}';
  }

  /*
      Getter & Setter
   */

  getMacAddress() {
    return this.macAddress;
  }

  setMacAddress(macAddress) {
    this.macAddress = macAddress;
  }

  getRssi() {
    return this.rssi;
  }

  setRssi(rssi) {
    this.rssi = rssi;
    this.invalidateDistance();
  }

  getCalibratedRssi() {
    this.calibratedRssi;
  }

  setCalibratedRssi(calibratedRssi) {
    this.calibratedRssi = calibratedRssi;
    this.invalidateDistance();
  }

  getCalibratedDistance() {
    return this.calibratedDistance;
  }

  setCalibratedDistance(calibratedDistance) {
    this.calibratedDistance = calibratedDistance;
    this.invalidateDistance();
  }

  getTransmissionPower() {
    return this.transmissionPower;
  }

  setTransmissionPower(transmissionPower) {
    this.transmissionPower = transmissionPower;
  }

  getAdvertisingPackets() {
    return this.advertisingPackets;
  }

  getLocationProvider() {
    return this.locationProvider;
  }

  setLocationProvider(locationProvider) {
    this.locationProvider = locationProvider;
  }
}

module.exports = Beacon;


const IndoorPositioning = require('./IndoorPositioning')
class IndoorPositionManager {
  constructor (beaconManager) {
    this.indoorPositionGroups = {};
    this.beaconManager = beaconManager;
  }

  add(name){
    if (!(name in this.indoorPositionGroups)){
      this.indoorPositionGroups[name] = new IndoorPositioning();
    }
  }
  updateLocation(){
    var usableBeacons = {};
      // TESTS
    for (var k in this.beaconManager.beaconMap){
      var beacon = this.beaconManager.beaconMap[k]
      //console.log(beacon.macAddress +beacon.station + ', '+beacon.getDistance())
      var name = beacon.macAddress+'-'+beacon.beaconType;
      if (!(name in usableBeacons)){
        usableBeacons[name] = [];
      }
      usableBeacons[name].push(beacon);
    }
    for (name in usableBeacons){
      var beaconList = usableBeacons[name];
      if (beaconList.length >= 3){
        this.add(name);
        this.indoorPositionGroups[name].updateLocation(beaconList);
      }
    }
  }

  getIndoorPositionGroups(){
    return this.indoorPositionGroups;
  }
}

module.exports = IndoorPositionManager;

const BeaconLocationProvider = require('./BeaconLocationProvider')
class EddystoneLocationProvider extends BeaconLocationProvider{
  constructor (beacon) {
    super(beacon);
  }
}

module.exports = EddystoneLocationProvider;

const BeaconLocationProvider = require('./BeaconLocationProvider')
class IBeaconLocationProvider extends BeaconLocationProvider{
  constructor (beacon) {
    super(beacon);
  }

}

module.exports = IBeaconLocationProvider;

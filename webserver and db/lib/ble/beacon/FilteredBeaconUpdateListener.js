const BeaconUpdateListener = require('./BeaconUpdateListener')
class FilteredBeaconUpdateListener extends BeaconUpdateListener{
  /**
  * The filter that will be used to decide if {@link #onMatchingBeaconUpdated(Beacon)} or {@link
  * #onNonMatchingBeaconUpdated(Beacon)} will be called.
  */
  constructor (beaconFilter) {
    this.beaconFilter = beaconFilter;
  }

  onBeaconUpdated(beacon) {
    if (beaconFilter.matches(beacon)){
      this.onMatchingBeaconUpdated(beacon);
    } else {
      this.onNonMatchingBeaconUpdated(beacon);
    }
  }

  /**
   * Will be called when {@link #onBeaconUpdated(Beacon)} gets called with a beacon that matches
   * the current {@link #beaconFilter}.
   */
   onMatchingBeaconUpdated(beacon) {

   }

  /**
   * Will be called when {@link #onBeaconUpdated(Beacon)} gets called with a beacon that doesn't
   * match the current {@link #beaconFilter}.
   */
  onNonMatchingBeaconUpdated(beacon) {
    // usually not of any interest
  }

  /*
    Getter & Setter
  */

  getBeaconFilter() {
    return this.beaconFilter;
  }

  setBeaconFilter(beaconFilter) {
    this.beaconFilter = beaconFilter;
  }
}

module.exports = FilteredBeaconUpdateListener;

// const IBeacon = require('../../ble/beacon/IBeacon')
// const Eddystone = require('../../ble/beacon/Eddystone')
class BeaconDistanceCalculator {
  /**
   * Different Path Loss Exponent parameters for different environments.
   *
   * @see <a href="https://en.wikipedia.org/wiki/Log-distance_path_loss_model"></a>
   */
  constructor(){
    this.PATH_LOSS_PARAMETER_OPEN_SPACE = 2;
    this.PATH_LOSS_PARAMETER_INDOOR = 1.7;
    this.PATH_LOSS_PARAMETER_OFFICE_HARD_PARTITION = 3.0;

    this.CALIBRATED_RSSI_AT_ONE_METER = -62;
    this.SIGNAL_LOSS_AT_ONE_METER = -41;

    this.pathLossParameter = this.PATH_LOSS_PARAMETER_OFFICE_HARD_PARTITION;
  }
  /**
   * Calculates the distance to the specified beacon using the <a href="https://en.wikipedia.org/wiki/Log-distance_path_loss_model">log-distance
   * path loss model</a>.
   */
 /**
  * Calculates the distance to the specified beacon using the <a href="https://en.wikipedia.org/wiki/Log-distance_path_loss_model">log-distance
  * path loss model</a>.
  */
  calculateDistanceTo(beacon, rssi = beacon.getFilteredRssi()){
    //console.log("beacon.getCalibratedRssi(): "+rssi)
    return this.calculateDistance(rssi, beacon.calibratedRssi, beacon.calibratedDistance, this.pathLossParameter);
  }

  /**
   * Use this method to remove the elevation delta from the distance between device and beacon.
   * Calculation based on Pythagoras to calculate distance on the floor (2D) to the beacon, if the
   * distance is double the elevation delta. The elevation expected refers to the distance above
   * the floor ground, rather than the altitude above sea level.
   */
  calculateDistanceWithoutElevationDeltaToDevice(beacon, rssi, deviceElevation) {
    var distance = this.calculateDistanceTo(beacon, rssi);
    if (beacon.hasLocation() && beacon.getLocation().hasElevation()) {
      var elevationDelta = Math.abs(beacon.getLocation().getElevation() - deviceElevation);
      // distance should be double of the elevationDelta to make pythagoras meaningful
      if (elevationDelta > 0 && distance > (elevationDelta * 2)) {
        var delta = Math.pow(distance, 2) - Math.pow(elevationDelta, 2);
        return Math.sqrt(delta);
      } else {
        return distance;
      }
    } else {
      return distance;
    }
  }

  /**
   * Calculates distances using the <a href="https://en.wikipedia.org/wiki/Log-distance_path_loss_model">log-distance
   * path loss model</a>.
   *
   * @param rssi               the currently measured RSSI
   * @param calibratedRssi     the RSSI measured at the calibration distance
   * @param calibratedDistance the distance in meters at which the calibrated RSSI was measured
   * @param pathLossParameter  the path-loss adjustment parameter
   */

  getCalibratedRssiAtOneMeter(calibratedRssi, calibratedDistance) {
    var calibratedRssiAtOneMeter;
    // if (calibratedDistance == new IBeacon().CALIBRATION_DISTANCE_DEFAULT) {
    //     calibratedRssiAtOneMeter = calibratedRssi;
    // } else if (calibratedDistance == new Eddystone().CALIBRATION_DISTANCE_DEFAULT) {
    //     calibratedRssiAtOneMeter = calibratedRssi + this.SIGNAL_LOSS_AT_ONE_METER;
    // } else {
    if (calibratedDistance == 1) {
        calibratedRssiAtOneMeter = calibratedRssi;
    } else if (calibratedDistance == 0) {
        calibratedRssiAtOneMeter = calibratedRssi + this.SIGNAL_LOSS_AT_ONE_METER;
    } else {
        calibratedRssiAtOneMeter = this.CALIBRATED_RSSI_AT_ONE_METER;
    }
    return calibratedRssiAtOneMeter;
  }
  /**
   * Calculates distances using the <a href="https://en.wikipedia.org/wiki/Log-distance_path_loss_model">log-distance
   * path loss model</a>.
   *
   * @param rssi              the currently measured RSSI
   * @param calibratedRssi    the RSSI measured at 1m distance
   * @param pathLossParameter the path-loss adjustment parameter
   */
  calculateDistance(rssi, calibratedRssi, calibratedDistance = 0, pathLossParameter) {
    if (calibratedDistance == 0){
      //console.log(this.getCalibratedRssiAtOneMeter(calibratedRssi, calibratedDistance))
      return Math.pow(10, (this.getCalibratedRssiAtOneMeter(calibratedRssi, calibratedDistance) - rssi) / (10 * pathLossParameter));
    }
    else{
      return Math.pow(10, (calibratedRssi - rssi) / (10 * pathLossParameter));
    }
  }

  setPathLossParameter(pathLossParameter) {
    this.pathLossParameter = pathLossParameter;
  }

  getPathLossParameter() {
    return this.pathLossParameter;
  }

}

module.exports = BeaconDistanceCalculator;

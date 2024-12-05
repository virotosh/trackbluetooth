
class AngleUtil {
  constructor () {

  }
  /**
   * Calculates the mean by converting all angles to corresponding points on the unit circle (i.e.
   * alpha to (cos(alpha), sin(alpha))).
   *
   * Caution: circular mean is NOT the arithmetic mean Example: the arithmetic mean of the three
   * angles 0°, 0° and 90° is (0+0+90)/3 = 30°, but the vector mean is 26.565°
   *
   * @see <a href="https://en.wikipedia.org/wiki/Mean_of_circular_quantities">Circle Mean</a>
   */
  toRadians(value){
   return value * (Math.PI / 180)
  }
  toDegrees(value){
    return value * (180 / Math.PI)
  }
  calculateMeanAngle(angles) {
    if (angles == null || angles.length == 0) {
        return 0;
    }
    if (angles.length == 1) {
        return angles[0];
    }
    var sumSin = 0;
    var sumCos = 0;
    for (var i = 0; i<angles.length; i++){
      var angle = angles[i];
      sumSin += Math.sin(this.toRadians(angle));
      sumCos += Math.cos(this.toRadians(angle));
    }
    return this.toDegrees(Math.atan2(sumSin, sumCos));
  }

  /**
   * Calculates the mean by converting all angles to corresponding points on the unit circle (i.e.
   * alpha to (cos(alpha), sin(alpha))).
   *
   * @see <a href="https://en.wikipedia.org/wiki/Mean_of_circular_quantities">Circle Mean</a>
   */
  calculateMeanAngle(deviceLocations) {
    var angles = deviceLocations.length;
    for (var i = 0; i < deviceLocations.length - 1; i++) {
        angles[i] = deviceLocations[i].getAngleTo(deviceLocations[i + 1]);
    }
    return this.calculateMeanAngle(angles);
  }

  /**
   * Length (angular) of a shortest way between two angles. It will be in range [0, 180].
   *
   * @see <a href="https://stackoverflow.com/questions/7570808/how-do-i-calculate-the-difference-of-two-angle-measures">Stackoverflow</a>
   */
  angleDistance(alpha, beta) {
      var phi = Math.abs(beta - alpha) % 360; // This is either the distance or 360 - distance
      return phi > 180 ? 360 - phi : phi;
  }
}

module.exports = AngleUtil;

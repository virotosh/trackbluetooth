/*
    decimal
    places   degrees          distance
    -------  -------          --------
    0        1                111  km
    1        0.1              11.1 km
    2        0.01             1.11 km
    3        0.001            111  m
    4        0.0001           11.1 m
    5        0.00001          1.11 m
    6        0.000001         11.1 cm
    7        0.0000001        1.11 cm
    8        0.00000001       1.11 mm
 */

/**
 * Created by steppschuh on 15.11.17.
 */
var LocationDistanceCalculator = require('./distance/LocationDistanceCalculator')
class Location {
  constructor(latitude = 0, longitude = 0, altitude = 0, elevation = 0){
    this.timestamp = new Date().getTime();
    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
    this.elevation = elevation;
    this.accuracy = 0;
  }
  /**
  * Calculates the distance between the current and the specified location in meters. Elevation /
  * altitude will be ignored.
  *
  * @return distance in meters
  */
  getDistanceTo(location) {
    return (new LocationDistanceCalculator).calculateDistanceBetween(this, location);
  }

  getAngleTo(location) {
    return this.getRotationAngleInDegrees(this, location);
  }

  /**
  * Shifts the current {@link #latitude} and {@link #longitude} based on the specified distance
  * and angle.
  *
  * @param distance in meters
  * @param angle    in degrees [0°-360°)
  * @see <a href="https://github.com/googlemaps/android-maps-utils/blob/master/library/src/com/google/maps/android/SphericalUtil.java">Java
  * Example</a>
  * @see <a href="http://mathworld.wolfram.com/GreatCircle.html">Great Circel Wolfram Alpha</a>
  * @see <a href="https://en.wikipedia.org/wiki/Great-circle_navigation#Finding_way-points">Great
  * Circle Wikipedia</a>
  */
  toRadians(value){
    return value * (Math.PI / 180);
  }

  toDegrees(value){
    return value * (180 / Math.PI);
  }

  shift(distance, angle) {
    var angle = angle % 360;
    var bearingRadians = this.toRadians(angle);
    var latitudeRadians = this.toRadians(this.latitude);
    var longitudeRadians = this.toRadians(this.longitude);
    // convert distance to km and calculate fraction of earth radius
    var distanceFraction = (distance / 1000) / (new LocationDistanceCalculator).EARTH_RADIUS;
    var shiftedLatitudeRadians = Math.asin(Math.sin(latitudeRadians) * Math.cos(distanceFraction) +
            Math.cos(latitudeRadians) * Math.sin(distanceFraction) * Math.cos(bearingRadians));
    var shiftedLongitudeRadians = longitudeRadians + Math.atan2(Math.sin(bearingRadians) * Math.sin(distanceFraction) *
            Math.cos(latitudeRadians), Math.cos(distanceFraction) - Math.sin(latitudeRadians) * Math.sin(shiftedLatitudeRadians));

    this.latitude = this.toDegrees(shiftedLatitudeRadians);
    this.longitude = this.toDegrees(shiftedLongitudeRadians);
    this.timestamp = new Date().getTime();
  }

  /**
   * Creates a copy of the current instance and calls {@link #shift(double, double)} on that
   * copy.
   *
   * @param distance in meters
   * @param angle    in degrees (0°-360°)
   */
  getShiftedLocation(distance, angle) {
      var shiftedLocation = new Location(this.latitude, this.longitude, this.altitude, this.elevation);
      shiftedLocation.shift(distance, angle);
      return shiftedLocation;
  }

  latitudeAndLongitudeEquals(location, delta = 0) {
    return (Math.abs(this.latitude - location.latitude) <= delta) && (Math.abs(this.longitude - location.longitude) <= delta);
  }

  hasLatitudeAndLongitude() {
    return this.latitude != 0 && this.longitude != 0;
  }

  hasAltitude() {
    return this.altitude != 0;
  }

  hasElevation() {
    return this.elevation != 0;
  }

  hasAccuracy() {
    return this.accuracy != 0;
  }

// NEED TO IMPLEMENT
// public URI generateGoogleMapsUri() {
//     try {
//         return new URI("https://www.google.com/maps/search/?api=1&query=" +
//                 String.valueOf(latitude) + "," + String.valueOf(longitude));
//     } catch (URISyntaxException e) {
//         throw new RuntimeException("Unable to generate Google Maps URI", e);
//     }
// }

  toString() {
    if (!this.hasLatitudeAndLongitude()) {
      return "Empty location";
    }
    var sb = "";
    sb += ("Latitude: " + this.latitude);
    sb += (" Longitude: " + this.longitude);
    if (this.hasAltitude()) {
      sb += (" Altitude: " + this.altitude + "m");
    }
    if (this.hasElevation()) {
      sb += (" Elevation: " + this.elevation + "m");
    }
    if (this.hasAccuracy()) {
      sb += (" Accuracy: " + this.accuracy + "m");
    }
    return sb;
  }

  /**
   * Calculates the angle between two locations in degrees. The result ranges from [0,360),
   * rotating CLOCKWISE, 0 and 360 degrees represents NORTH, 90 degrees represents EAST. This is
   * also referred to as bearing.
   *
   * Calculation was derived from this <a href="http://www.igismap.com/formula-to-find-bearing-or-heading-angle-between-two-points-latitude-longitude/">
   * Bearing Calculation formula.</a>
   *
   * @param centerLocation Location we are rotating around.
   * @param targetLocation Location we want to calculate the angle to.
   * @return angle in degrees
   */
  getRotationAngleInDegrees(centerLocation, targetLocation) {
    var longitudeDelta = this.toRadians(targetLocation.longitude - centerLocation.longitude);
    var centerLocationLatitude = this.toRadians(centerLocation.latitude);
    var targetLocationLatitude = this.toRadians(targetLocation.latitude);

    var x = (Math.cos(centerLocationLatitude) * Math.sin(targetLocationLatitude))
            - (Math.sin(centerLocationLatitude) * Math.cos(targetLocationLatitude) * Math.cos(longitudeDelta));
    var y = Math.sin(longitudeDelta) * Math.cos(targetLocationLatitude);

    var angle = this.toDegrees(Math.atan2(y, x));

    // convert the interval (-180, 180] to [0, 360)
    if (angle < 0) {
        angle += 360;
    }

    return angle; // note that the angle can be '-0.0'
  }

  /*
      Getter & Setter
   */

  getLatitude() {
    return this.latitude;
  }

  setLatitude(latitude) {
      this.latitude = latitude;
      this.timestamp = new Date().getTime();
  }

  getLongitude() {
    return this.longitude;
  }

  setLongitude(longitude) {
    this.longitude = longitude;
    this.timestamp = new Date().getTime();
  }

  getAltitude() {
    return this.altitude;
  }

  setAltitude(altitude) {
    this.altitude = altitude;
  }

  getTimestamp() {
    return this.timestamp;
  }

  setTimestamp(timestamp) {
    this.timestamp = timestamp;
  }

  getElevation() {
    return this.elevation;
  }

  setElevation(elevation) {
    this.elevation = elevation;
  }

  getAccuracy() {
    return this.accuracy;
  }

  setAccuracy(accuracy) {
    this.accuracy = accuracy;
  }
}
module.exports = Location;

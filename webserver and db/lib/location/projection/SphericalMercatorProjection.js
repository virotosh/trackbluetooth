const Location = require('../Location')

class SphericalMercatorProjection {
  constructor () {
    this.EARTH_RADIUS = 6378137.0; // in meters on the equator (WGS-84 semi-major axis)
    this.E2 = 0.00669437999013779; //WGS-84 first eccentricity squared
    this.A1 = this.EARTH_RADIUS * this.E2; //A1 = a*E2
    this.A2 = this.A1 * this.A1; //A2 = A1*A1
    this.A3 = this.A1 * this.E2 / 2; //A3 = A1*E2/2
    this.A4 = this.A2 * 2.5; //A4 = 2.5*A2
    this.A5 = this.A1 + this.A3; //A5 = A1+A3
    this.A6 = 1 - this.E2; //A6 = 1-E2
  }
  toRadians(value){
    return value * (Math.PI / 180);
  }

  toDegrees(value){
    return value * (180 / Math.PI);
  }
  /**
   * Caution: The conversion used by these simpler 2D methods is not compatible with the 3D
   * Earth-Centered-Earth-Fixed (ECEF) to location conversion.
   */
  yToLatitude( y) {
    return this.toDegrees(Math.atan(Math.exp(y / this.EARTH_RADIUS)) * 2 - Math.PI / 2);
  }

  xToLongitude( x) {
    return this.toDegrees(x / this.EARTH_RADIUS);
  }

  latitudeToY(latitude) {
    return Math.log(Math.tan(Math.PI / 4 + this.toRadians(latitude) / 2)) * this.EARTH_RADIUS;
  }

  longitudeToX(longitude) {
    return this.toRadians(longitude) * this.EARTH_RADIUS;
  }

  /**
   * Convenience method to convert Earth-Centered-Earth-Fixed (ECEF) to Location. Expects input to
   * be in radians.
   */
  ecefToLocation(ecef) {
    var geodetic = this.ecefToGeodetic(ecef);
    return new Location(this.toDegrees(geodetic[0]), this.toDegrees(geodetic[1]), 0, this.toDegrees(geodetic[2]));
  }

  /**
   * Convert Earth-Centered-Earth-Fixed (ECEF) to latitude, longitude, elevation. Input is a three
   * element array containing x, y, z in meters. Output array contains latitude and longitude in
   * radians, and elevation in meters.
   *
   * @see <a href="http://danceswithcode.net/engineeringnotes/geodetic_to_ecef/geodetic_to_ecef.html">Source</a>
   */
  ecefToGeodetic(ecef) {
    var zp, w2, w, r2, r, s2, c2, s, c, ss, g, rg, rf, u, v, m, f, p, x, y, z;
    var geodetic = [];
    x = ecef[0];
    y = ecef[1];
    z = ecef[2];
    zp = Math.abs(z);
    w2 = x * x + y * y;
    w = Math.sqrt(w2);
    r2 = w2 + z * z;
    r = Math.sqrt(r2);
    geodetic[1] = Math.atan2(y, x);       // Longitude
    s2 = z * z / r2;
    c2 = w2 / r2;
    u = this.A2 / r;
    v = this.A3 - this.A4 / r;
    if (c2 > 0.3) {
        s = (zp / r) * (1.0 + c2 * (this.A1 + u + s2 * v) / r);
        geodetic[0] = Math.asin(s);
        ss = s * s;
        c = Math.sqrt(1.0 - ss);
    } else {
        c = (w / r) * (1.0 - s2 * (this.A5 - u - c2 * v) / r);
        geodetic[0] = Math.acos(c);
        ss = 1.0 - c * c;
        s = Math.sqrt(ss);
    }
    g = 1.0 - this.E2 * ss;
    rg = this.EARTH_RADIUS / Math.sqrt(g);
    rf = this.A6 * rg;
    u = w - rg * c;
    v = zp - rf * s;
    f = c * u + s * v;
    m = c * v - s * u;
    p = m / (rf / g + f);

    geodetic[0] = geodetic[0] + p;
    geodetic[2] = f + m * p / 2.0;     // Elevation
    if (z < 0.0) {
        geodetic[0] *= -1.0;           // Latitude
    }
    return geodetic;
  }

  /**
   * Converts latitude, longitude, elevation to Earth-Centered-Earth-Fixed (ECEF).
   */
  locationToEcef(location) {
    var geodetic = [this.toRadians(location.getLatitude()), this.toRadians(location.getLongitude()), location.getAltitude()];
    return this.geodeticToEcef(geodetic);
  }

  /**
   * Convert latitude, longitude, height to Earth-Centered-Earth-Fixed (ECEF). Input is a three
   * element array containing latitude, longitude (radians) and altitude (in meters). Returned
   * array contains x, y, z in meters
   *
   * @see <a href="http://danceswithcode.net/engineeringnotes/geodetic_to_ecef/geodetic_to_ecef.html">Source</a>
   */
  geodeticToEcef(geodetic) {
    var ecef = [];
    var latitude = geodetic[0];
    var longitude = geodetic[1];
    var altitude = geodetic[2];
    var n = this.EARTH_RADIUS / Math.sqrt(1 - this.E2 * Math.sin(latitude) * Math.sin(latitude));
    ecef[0] = (n + altitude) * Math.cos(latitude) * Math.cos(longitude);
    ecef[1] = (n + altitude) * Math.cos(latitude) * Math.sin(longitude);
    ecef[2] = (n * (1 - this.E2) + altitude) * Math.sin(latitude);
    return ecef;
  }
}

module.exports = SphericalMercatorProjection;

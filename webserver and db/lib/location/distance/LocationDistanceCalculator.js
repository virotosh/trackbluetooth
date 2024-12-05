class LocationDistanceCalculator{
  constructor(){
    this.EARTH_RADIUS = 6371;
  }
  calculateDistanceBetween(fromLocation, toLocation) {
    return calculateDistanceBetween(
            fromLocation.getLatitude, fromLocation.getLongitude, fromLocation.getAltitude,
            toLocation.getLatitude, toLocation.getLongitude, toLocation.getAltitude
    );
  }
  /**
   * Calculates the distance between two points in latitude and longitude taking the altitude
   * delta into account. Uses the Haversine method as its base.
   *
   * @return Distance in Meters
   * @see <a href="https://stackoverflow.com/a/16794680/1188330">StackOverflow</a>
   */
  toRadians(value){
    return value * (Math.PI / 180)
  }
  calculateDistanceBetween(fromLatitude, fromLongitude, fromAltitude,
                                                  toLatitude, toLongitude, toAltitude) {
    var latDistance = toRadians(toLatitude - fromLatitude);
    var lonDistance = toRadians(toLongitude - fromLongitude);
    var a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
           + Math.cos(Math.toRadians(fromLatitude)) * Math.cos(toRadians(toLatitude))
           * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = this.EARTH_RADIUS * c * 1000; // convert to meters
    var height = fromAltitude - toAltitude;
    distance = Math.pow(distance, 2) + Math.pow(height, 2);
    return Math.sqrt(distance);
    }
}

module.exports = LocationDistanceCalculator;

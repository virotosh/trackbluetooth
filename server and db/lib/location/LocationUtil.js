const Location = require('./Location')
class LocationUtil {
  constructor () {
  }

  calculateMeanLocationFromLast(locationList, amount) {
    // timeUnit in millis
    var matchingLocations = this.getLocationsFromLast(locationList, amount);
    return this.calculateMeanLocation(matchingLocations);
  }

  calculateMeanLocation(locationList) {
    if (locationList.length < 1) {
      return null;
    } else {
      var latitudeSum = 0;
      var longitudeSum = 0;
      var altitudeSum = 0;
      var elevationSum = 0;
      var accuracySum = 0;
      for (var i=0; i<locationList.length; i++){
        var location = locationList[i];
        latitudeSum += location.getLatitude();
        longitudeSum += location.getLongitude();
        elevationSum += location.getElevation();
        accuracySum += location.getAccuracy();
      }
      var meanLocation = new Location(latitudeSum / locationList.length,
                                  longitudeSum / locationList.length,
                                  altitudeSum / locationList.length,
                                  elevationSum / locationList.length
                                );
      meanLocation.setAccuracy(accuracySum / locationList.length);
      return meanLocation;
    }
  }

  getLocationsBetween(locationList, minimumTimestamp, maximumTimestamp) {
    var matchingLocations = [];
    for (var i = 0; i<locationList.length; i++){
      var location = locationList[i];
      if (location.getTimestamp() < minimumTimestamp || location.getTimestamp() >= maximumTimestamp) {
        continue;
      }
      matchingLocations.push(location);
    }
    return matchingLocations;
  }

  getLocationsFromLast(locationList, amount) {
    return this.getLocationsBetween(locationList, new Date().getTime() - amount, new Date().getTime());
  }

  getLocationsSince(locationList, timestamp) {
    return this.getLocationsBetween(locationList, timestamp, new Date().getTime());
  }

  getLocationsBefore(locationList, timestamp) {
    return this.getLocationsBetween(locationList, 0, timestamp);
  }
}

module.exports = LocationUtil;

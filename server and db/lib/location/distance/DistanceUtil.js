class DistanceUtil{
  constructor(){
    this.HUMAN_WALKING_SPEED = 1.388889
  }

  getClosestEvenDistance(distance, evenIncrement){
    return Math.round(distance / evenIncrement) * evenIncrement;
  }

  getReasonableSmallerEvenDistance(distance){
    return this.getClosestEvenDistance(distance, this.getMaximumEvenIncrement(distance));
  }

  getMaximumEvenIncrement(distance){
    if (distance < 10) {
      return 1;
    }
    return Math.pow(10, Math.floor(Math.log10(distance)));
  }

  walkingSpeedFilter(oldLocation, newLocation){
    return this.speedFilter(oldLocation, newLocation, HUMAN_WALKING_SPEED);
  }

  /**
   * Define a maximum movement speed to restrain a new location being further away than the
   * distance possible in that time window.
   */
  speedFilter(oldLocation, newLocation, maximumSpeed) {
    var distance = oldLocation.getDistanceTo(newLocation);
    var timestampDelta = newLocation.getTimestamp() - oldLocation.getTimestamp();
    var currentSpeed = 0;
    if (timestampDelta != 0) {
      currentSpeed = distance / (timestampDelta / 1000);
    }
    if (currentSpeed > maximumSpeed) {
      var angle = oldLocation.getAngleTo(newLocation);
      var adjustedLocation = oldLocation.getShiftedLocation(maximumSpeed, angle);
      adjustedLocation.setTimestamp(newLocation.getTimestamp());
      return adjustedLocation;
    } else {
      return newLocation;
    }
  }
}
module.exports = DistanceUtil;

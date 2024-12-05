const RssiFilter = require('./RssiFilter')
class WindowFilter extends RssiFilter{
  constructor (duration=null, maximumTimestamp=null) {
    if (duration!=null && maximumTimestamp==null){
      maximumTimestamp = duration;
      duration = 5000;
    }
    super(duration, maximumTimestamp);
    this.duration = duration;
    this.maximumTimestamp = maximumTimestamp;
    this.minimumTimestamp = maximumTimestamp - duration;
  }
  updateDuration() {
    this.duration = this.maximumTimestamp - this.minimumTimestamp;
  }

  getRecentAdvertisingPackets(beacon) {
    return beacon.getAdvertisingPacketsBetween(this.minimumTimestamp, this.maximumTimestamp + 1);
  }

  /*
      Getter & Setter
   */

  getDuration() {
    return this.duration;
  }

  getMaximumTimestamp() {
    return this.maximumTimestamp;
  }

  setMaximumTimestamp(maximumTimestamp) {
    this.maximumTimestamp = maximumTimestamp;
    this.updateDuration();
  }

  getMinimumTimestamp() {
    return this.minimumTimestamp;
  }

  setMinimumTimestamp(minimumTimestamp) {
    this.minimumTimestamp = minimumTimestamp;
    this.updateDuration();
  }
}
module.exports = WindowFilter;

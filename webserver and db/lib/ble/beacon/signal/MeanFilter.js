const WindowFilter = require('./WindowFilter');
const AdvertisingPacketUtil = require('../../advertising/AdvertisingPacketUtil')
class MeanFilter extends WindowFilter{
  constructor (duration = null, maximumTimestamp = null) {
    super(duration, maximumTimestamp);
  }

  filter(beacon) {
    var advertisingPackets = this.getRecentAdvertisingPackets(beacon);
    var rssiArray = new AdvertisingPacketUtil.getRssisFromAdvertisingPackets(advertisingPackets);
    return new AdvertisingPacketUtil.calculateMean(rssiArray);
  }
}

module.exports = MeanFilter;

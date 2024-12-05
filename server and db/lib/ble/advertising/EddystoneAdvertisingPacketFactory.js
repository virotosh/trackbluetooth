const EddystoneAdvertisingPacket = require('./EddystoneAdvertisingPacket')
const AdvertisingPacketFactory = require('./AdvertisingPacketFactory')
class EddystoneAdvertisingPacketFactory extends AdvertisingPacketFactory{
  constructor () {
    super('EddystoneAdvertisingPacketFactory');
  }

  canCreateAdvertisingPacket(advertisingData) {
    return new EddystoneAdvertisingPacket(advertisingData).meetsSpecification(advertisingData);
  }

  createAdvertisingPacket(advertisingData) {
      return new EddystoneAdvertisingPacket(advertisingData);
  }
}

module.exports = EddystoneAdvertisingPacketFactory;

const IBeaconAdvertisingPacket = require('./IBeaconAdvertisingPacket')
const AdvertisingPacketFactory = require('./AdvertisingPacketFactory')
class IBeaconAdvertisingPacketFactory extends AdvertisingPacketFactory{
  constructor () {
    super('IBeaconAdvertisingPacketFactory');
  }

  canCreateAdvertisingPacket(advertisingData) {
    return new IBeaconAdvertisingPacket(advertisingData).meetsSpecification(advertisingData);
  }

  createAdvertisingPacket(advertisingData) {
      return new IBeaconAdvertisingPacket(advertisingData);
  }
}

module.exports = IBeaconAdvertisingPacketFactory;

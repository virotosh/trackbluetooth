const EddystoneAdvertisingPacketFactory = require('./EddystoneAdvertisingPacketFactory')
const IBeaconAdvertisingPacketFactory = require('./IBeaconAdvertisingPacketFactory')
class AdvertisingPacketFactoryManager {
  constructor () {
    this.advertisingPacketFactories = [];
    this.advertisingPacketFactories.push(new EddystoneAdvertisingPacketFactory());
    this.advertisingPacketFactories.push(new IBeaconAdvertisingPacketFactory());
  }

  createAdvertisingPacket(advertisingData) {
    var advertisingPacketFactory = this.getAdvertisingPacketFactory(advertisingData);
    return advertisingPacketFactory != null ? advertisingPacketFactory.createAdvertisingPacket(advertisingData) : null;
  }

  /**
     * Iterates over {@link #advertisingPacketFactories} and returns the first element that returns
     * true when calling {@link AdvertisingPacketFactory#canCreateAdvertisingPacket(byte[])}.
     *
     * Returns null if no matching factory was found.
     */
   getAdvertisingPacketFactory(advertisingData) {
     var factory = null;
     for (var i=0; i<this.advertisingPacketFactories.length; i++){
       var advertisingPacketFactory = this.advertisingPacketFactories[i];
       factory = advertisingPacketFactory.getAdvertisingPacketFactory(advertisingData);
       if (factory != null) {
         break;
       }
     }
     //console.log(factory);
     return factory;
   }

  /**
   * Inserts the specified factory into {@link #advertisingPacketFactories}.
   *
   * Note: The specified factory will be set to the first element in the list and thus may be used
   * before the already existing factories.
   */
  addAdvertisingPacketFactory(advertisingPacketFactory) {
    this.advertisingPacketFactories[0] = advertisingPacketFactory;
  }

  /*
      Getter & Setter
   */
  getAdvertisingPacketFactories() {
    return this.advertisingPacketFactories;
  }

  setAdvertisingPacketFactories(advertisingPacketFactories) {
    this.advertisingPacketFactories = advertisingPacketFactories;
  }
}

module.exports = AdvertisingPacketFactoryManager;

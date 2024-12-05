class AdvertisingPacketFactory {
  constructor (packetClass) {
    this.subFactoryMap = {};
    this.packetClass = packetClass;
  }

  canCreateAdvertisingPacket(advertisingData) {

  }

  canCreateAdvertisingPacketWithSubFactories(advertisingData) {
    for (var key in this.subFactoryMap) {
      var advertisingPacketFactory = this.subFactoryMap[key];
      if (advertisingPacketFactory.canCreateAdvertisingPacketWithSubFactories(advertisingData)) {
          return true;
      }
    }
    return this.canCreateAdvertisingPacket(advertisingData);
  }

  createAdvertisingPacket(advertisingData) {

  }

  createAdvertisingPacketWithSubFactories(advertisingData){
    for (var key in this.subFactoryMap) {
      var advertisingPacketFactory = this.subFactoryMap[key];
      if (advertisingPacketFactory.canCreateAdvertisingPacketWithSubFactories(advertisingData)) {
        return advertisingPacketFactory.createAdvertisingPacket(advertisingData);
      }
    }
    return this.createAdvertisingPacket(advertisingData);
  }

  // MIGHT NOT NEED
  // getAdvertisingPacketFactory(advertisingPacketClass){
  //   if (this.subFactoryMap.containsKey(advertisingPacketClass)) {
  //     return this.subFactoryMap[advertisingPacketClass];
  //   } else {
  //       for (var key in subFactoryMap) {
  //         return subFactoryMap[key].getAdvertisingPacketFactory(advertisingPacketClass);
  //       }
  //       return null;
  //   }
  // }

  getAdvertisingPacketFactory(advertisingData) {
    if (!this.canCreateAdvertisingPacket(advertisingData)) {
      return null;
    }
    for (var key in this.subFactoryMap) {
      var advertisingPacketFactory = this.subFactoryMap[key];
      if (advertisingPacketFactory.getAdvertisingPacketFactory(advertisingData) != null) {
          return advertisingPacketFactory;
      }
    }
    return this;
  }

  addAdvertisingPacketFactory(factory) {
    if (!(factory.getPacketClass() in this.subFactoryMap)) {
      this.subFactoryMap[factory.getPacketClass()] = factory;
    } else {
      for (var key in subFactoryMap) {
        subFactoryMap[key].addAdvertisingPacketFactory(factory);
      }
    }
  }
  // MIGHT BE NOT NEED
  //   public void removeAdvertisingPacketFactory(Class<AP> advertisingPacketClass) {
  //       if (!packetClass.isAssignableFrom(advertisingPacketClass)) {
  //           return;
  //       }
  //       if (packetClass == advertisingPacketClass.getSuperclass() && subFactoryMap.containsKey(advertisingPacketClass)) {
  //           subFactoryMap.remove(advertisingPacketClass);
  //       } else {
  //           for (Map.Entry<Class<AP>, AdvertisingPacketFactory<AP>> classAdvertisingPacketFactoryEntry : subFactoryMap.entrySet()) {
  //               if (classAdvertisingPacketFactoryEntry.getKey().isAssignableFrom(advertisingPacketClass)) {
  //                   classAdvertisingPacketFactoryEntry.getValue().removeAdvertisingPacketFactory(advertisingPacketClass);
  //               }
  //           }
  //       }
  //   }

  removeAdvertisingPacketFactory(factory) {
    this.removeAdvertisingPacketFactory(factory.getPacketClass());
  }

  getSubFactoryMap() {
    return this.subFactoryMap;
  }

  getPacketClass() {
    return this.packetClass;
  }
}

module.exports = AdvertisingPacketFactory;

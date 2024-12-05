const AdvertisingPacket = require('./AdvertisingPacket');
//const Eddystone = require('../beacon/Eddystone');
class EddystoneAdvertisingPacket extends AdvertisingPacket{
  constructor (data) {
    super(data);
  }

  parseData(){
    // NEED IMPLEMENTATION
  }

  getBeaconClass(){
    return Eddystone.constructor.name;
  }

  meetsSpecification(data){
    if (data == null){
      return false;
    }
    if (data.beaconType.toLowerCase().includes('eddystone')){
      return true;
    }
    return false;
  }

  toString() {
    return "AdvertisingPacket (" +
            " ID: " + this.data.id +
            " beaconType: " + this.data.beaconType +
            " station: " + this.data.station +
            ')';
  }
  // private void parseData() {
  //       flagsBytes = getFlags(data);
  //       eddystoneUuidBytes = getEddystoneUuid(data);
  //       frameBytes = getFrameBytes(data);
  //   }
  //
  //   @Override
  //   public Class<? extends Beacon> getBeaconClass() {
  //       return Eddystone.class;
  //   }
  //
  //   public static boolean meetsSpecification(byte[] data) {
  //       if (data == null || data.length < 15) {
  //           return false;
  //       }
  //       if (!Arrays.equals(getFlags(data), EXPECTED_FLAGS)) {
  //           return false;
  //       }
  //       if (!Arrays.equals(getEddystoneUuid(data), EXPECTED_EDDYSTONE_UUID)) {
  //           return false;
  //       }
  //       return true;
  //   }
  //
  //   public static byte[] getFlags(byte[] data) {
  //       return Arrays.copyOfRange(data, 0, 3);
  //   }
  //
  //   public static byte[] getEddystoneUuid(byte[] data) {
  //       return Arrays.copyOfRange(data, 3, 3 + 4);
  //   }
  //
  //   public static byte[] getFrameBytes(byte[] data) {
  //       return Arrays.copyOfRange(data, 7, data.length);
  //   }
  //
  //   /*
  //       Getter & Setter
  //    */
  //
  //   public byte[] getFlagsBytes() {
  //       if (flagsBytes == null) {
  //           flagsBytes = getFlags(data);
  //       }
  //       return flagsBytes;
  //   }
  //
  //   public void setFlagsBytes(byte[] flagsBytes) {
  //       this.flagsBytes = flagsBytes;
  //   }
  //
  //   public byte[] getEddystoneUuidBytes() {
  //       if (eddystoneUuidBytes == null) {
  //           eddystoneUuidBytes = getEddystoneUuid(data);
  //       }
  //       return eddystoneUuidBytes;
  //   }
  //
  //   public void setEddystoneUuidBytes(byte[] eddystoneUuidBytes) {
  //       this.eddystoneUuidBytes = eddystoneUuidBytes;
  //   }
  //
  //   public byte[] getFrameBytes() {
  //       if (frameBytes == null) {
  //           frameBytes = getFrameBytes(data);
  //       }
  //       return frameBytes;
  //   }
  //
  //   public void setFrameBytes(byte[] frameBytes) {
  //       this.frameBytes = frameBytes;
  //   }
}

module.exports = EddystoneAdvertisingPacket;

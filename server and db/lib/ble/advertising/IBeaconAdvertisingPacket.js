const AdvertisingPacket = require('./AdvertisingPacket');
//const IBeacon = require('../beacon/IBeacon');
class IBeaconAdvertisingPacket extends AdvertisingPacket{
  constructor (data) {
    super(data);
    this.proximityUuid = null;
    this.major = null;
    this.minor = null;
    this.measuredPowerByte = 0;
  }

  parseData() {
    // NEED IMPLEMENTATION
    measuredPowerByte = this.data.iBeacon.txPower;
  }

  getBeaconClass(){
    return IBeacon.constructor.name;
  }

  meetsSpecification(data){
    if (data == null){
      return false;
    }
    if (data.beaconType.toLowerCase().includes('ibeacon')){
      return true;
    }
    return false;
  }

  toString() {
    return "AdvertisingPacket (" +
            " Proximity UUID: " + this.data.iBeacon.uuid +
            " Major: " + this.data.iBeacon.major +
            " Minor: " + this.data.iBeacon.minor +
            " RSSI at 1m: " + this.data.iBeacon.txPower +
            ')';
  }

  dataMatchesUuid(data, referenceUuid) {
    if (!data.beaconType.toLowerCase().includes('ibeacon')){
      return false;
    }
    return this.getProximityUuid(data) == referenceUuid;
  }

  /*
   * Setter & Getter
   *
  */
  getProximityUuid() {
    return this.proximityUuid;
  }

  setProximityUuid(proximityUuid) {
    this.proximityUuid = proximityUuid;
  }

  getMajor() {
    return this.major;
  }

  setMajor( major) {
    this.major = major;
  }

  getMinor() {
    return this.minor;
  }

  setMinor(minor) {
    this.minor = minor;
  }

  getMeasuredPowerByte(){
    if (this.measuredPowerByte == 0){
      this.measuredPowerByte = this.data.iBeacon.txPower;
    }
    return this.measuredPowerByte;
  }

  setMeasuredPowerByte(measuredPowerByte){
    this.measuredPowerByte = measuredPowerByte;
  }

  // private void parseData() {
  //       flagsBytes = getFlagsBytes(data);
  //       lengthByte = getLengthBytes(data);
  //       typeByte = getTypeBytes(data);
  //       companyIdBytes = getCompanyIdBytes(data);
  //       beaconTypeBytes = getBeaconTypeBytes(data);
  //       proximityUuidBytes = getProximityUuidBytes(data);
  //       majorBytes = getMajorBytes(data);
  //       minorBytes = getMinorBytes(data);
  //       measuredPowerByte = getMeasuredPowerBytes(data);
  //   }
  //
  //   @Override
  //   public Class<? extends Beacon> getBeaconClass() {
  //       return IBeacon.class;
  //   }
  //
  //
  //   public static boolean meetsSpecification(byte[] data) {
  //       if (data == null || data.length < 29) {
  //           return false;
  //       }
  //
  //       // In order to support advertising packets from manufacturers that
  //       // adjusted the data type, we'll ignore this for now.
  //       // See: https://github.com/neXenio/BLE-Indoor-Positioning/issues/79
  //       /*
  //       if (getTypeBytes(data) != EXPECTED_TYPE) {
  //           return false;
  //       }
  //       */
  //       if (!Arrays.equals(getFlagsBytes(data), EXPECTED_FLAGS)) {
  //           return false;
  //       }
  //       if (!Arrays.equals(getBeaconTypeBytes(data), EXPECTED_BEACON_TYPE)) {
  //           return false;
  //       }
  //       return true;
  //   }
  //
  //   public static byte[] getFlagsBytes(byte[] data) {
  //       return Arrays.copyOfRange(data, 0, 3);
  //   }
  //
  //   public static byte getLengthBytes(byte[] data) {
  //       return data[3];
  //   }
  //
  //   public static byte getTypeBytes(byte[] data) {
  //       return data[4];
  //   }
  //
  //   public static byte[] getCompanyIdBytes(byte[] data) {
  //       return Arrays.copyOfRange(data, 5, 5 + 2);
  //   }
  //
  //   public static byte[] getBeaconTypeBytes(byte[] data) {
  //       return Arrays.copyOfRange(data, 7, 7 + 2);
  //   }
  //
  //   public static byte[] getProximityUuidBytes(byte[] data) {
  //       return Arrays.copyOfRange(data, 9, 9 + 24);
  //   }
  //
  //   public static byte[] getMajorBytes(byte[] data) {
  //       return Arrays.copyOfRange(data, 25, 25 + 2);
  //   }
  //
  //   public static byte[] getMinorBytes(byte[] data) {
  //       return Arrays.copyOfRange(data, 27, 27 + 2);
  //   }
  //
  //   public static byte getMeasuredPowerBytes(byte[] data) {
  //       return data[29];
  //   }
  //   /**
  //    * According to the iBeacon specification, minor and major are unsigned integer values between 0
  //    * and 65535 (2 bytes each).
  //    *
  //    * @param data the minor or major bytes (2 bytes)
  //    * @return integer between 0 and 65535
  //    */
  //   private static int getInt(byte[] data) {
  //       return ByteBuffer.wrap(new byte[]{data[1], data[0], 0, 0}).order(ByteOrder.LITTLE_ENDIAN).getInt();
  //   }
  //
  //   /*
  //       Getter & Setter
  //    */
  //
  //   public byte[] getFlagsBytes() {
  //       if (flagsBytes == null) {
  //           flagsBytes = getFlagsBytes(data);
  //       }
  //       return flagsBytes;
  //   }
  //
  //   public void setFlagsBytes(byte[] flagsBytes) {
  //       this.flagsBytes = flagsBytes;
  //   }
  //
  //   public byte getLengthByte() {
  //       if (lengthByte == 0) {
  //           lengthByte = getLengthBytes(data);
  //       }
  //       return lengthByte;
  //   }
  //
  //   public void setLengthByte(byte lengthByte) {
  //       this.lengthByte = lengthByte;
  //   }
  //
  //   public byte getTypeByte() {
  //       if (typeByte == 0) {
  //           typeByte = getTypeBytes(data);
  //       }
  //       return typeByte;
  //   }
  //
  //   public void setTypeByte(byte typeByte) {
  //       this.typeByte = typeByte;
  //   }
  //
  //   public byte[] getCompanyIdBytes() {
  //       if (companyIdBytes == null) {
  //           companyIdBytes = getCompanyIdBytes(data);
  //       }
  //       return companyIdBytes;
  //   }
  //
  //   public void setCompanyIdBytes(byte[] companyIdBytes) {
  //       this.companyIdBytes = companyIdBytes;
  //   }
  //
  //   public byte[] getBeaconTypeBytes() {
  //       if (beaconTypeBytes == null) {
  //           beaconTypeBytes = getBeaconTypeBytes(data);
  //       }
  //       return beaconTypeBytes;
  //   }
  //
  //   public void setBeaconTypeBytes(byte[] beaconTypeBytes) {
  //       this.beaconTypeBytes = beaconTypeBytes;
  //   }
  //
  //   public byte[] getProximityUuidBytes() {
  //       if (proximityUuidBytes == null) {
  //           proximityUuidBytes = getProximityUuidBytes(data);
  //       }
  //       return proximityUuidBytes;
  //   }
  //
  //   public void setProximityUuidBytes(byte[] proximityUuidBytes) {
  //       this.proximityUuidBytes = proximityUuidBytes;
  //   }
  //
  //   public byte[] getMajorBytes() {
  //       if (majorBytes == null) {
  //           majorBytes = getMajorBytes(data);
  //       }
  //       return majorBytes;
  //   }
  //
  //   public void setMajorBytes(byte[] majorBytes) {
  //       this.majorBytes = majorBytes;
  //   }
  //
  //   public byte[] getMinorBytes() {
  //       if (minorBytes == null) {
  //           minorBytes = getMinorBytes(data);
  //       }
  //       return minorBytes;
  //   }
  //
  //   public void setMinorBytes(byte[] minorBytes) {
  //       this.minorBytes = minorBytes;
  //   }
  //
  //   public byte getMeasuredPowerByte() {
  //       if (measuredPowerByte == 0) {
  //           measuredPowerByte = getMeasuredPowerBytes(data);
  //       }
  //       return measuredPowerByte;
  //   }
  //
  //   public void setMeasuredPowerByte(byte measuredPowerByte) {
  //       this.measuredPowerByte = measuredPowerByte;
  //   }
  //

}

module.exports = IBeaconAdvertisingPacket;

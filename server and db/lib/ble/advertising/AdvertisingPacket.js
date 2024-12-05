class AdvertisingPacket {
    constructor(data){
        this.data = data;
        this.station = null;
        this.rssi = 0;
        this.timestamp = new Date().getTime();
    }
    // Get rid of circular dependency
    // from(data){
    //   var advertisingPacket = null;
    //   if (new IBeaconAdvertisingPacket().meetsSpecification(data)) {
    //     console.log('IBeaconAdvertisingPacket');
    //     advertisingPacket = new IBeaconAdvertisingPacket(data);
    //   } else if (new EddystoneAdvertisingPacket().meetsSpecification(data)) {
    //     console.log('EddystoneAdvertisingPacket');
    //     advertisingPacket = new EddystoneAdvertisingPacket(data);
    //   }
    //   return advertisingPacket;
    // }

    toString(){
        return "AdvertisingPacket{" +
                "data=" + this.data +
                ", station=" + this.station +
                ", rssi=" + this.rssi +
                ", timestamp=" + this.timestamp +
                '}';

    }

    dataEquals(advertisingPacket) {
        if (advertisingPacket == null) {
            return false;
        }
        return (this.data == advertisingPacket.data);
    }

    // NEED TO IMPLEMENT THIS

    //     public abstract Class<? extends Beacon> getBeaconClass();

    /*
        Getter & Setter
    */

    getData() {
        return data;
    }

    setData(data) {
        this.data = data;
    }

    getStation() {
        return this.station;
    }

    setStation(id) {
        this.station = station;
    }

    getRssi() {
        return this.rssi;
    }

    setRssi(rssi) {
        this.rssi = rssi;
    }

    getTimestamp() {
        return this.timestamp;
    }

    setTimestamp(timestamp) {
        this.timestamp = timestamp;
    }

}

module.exports = AdvertisingPacket;

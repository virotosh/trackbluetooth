const WindowFilter = require('./WindowFilter');
const AdvertisingPacketUtil = require('../../advertising/AdvertisingPacketUtil')
class ArmaFilter extends WindowFilter {
  /**
 * Created by leon on 02.01.18.
 *
 * Kalman filtering, also known as linear quadratic estimation (LQE), is an algorithm that uses a
 * series of measurements observed over time, containing statistical noise and other inaccuracies,
 * and produces estimates of unknown variables that tend to be more accurate than those based on a
 * single measurement alone, by using Bayesian inference and estimating a joint probability
 * distribution over the variables for each timeframe.
 *
 *
 * Since RSSI signals are largely influenced by signal noise, taking samples from the signal seems
 * likely to be beneficial. Evaluate Unscented Kalman filter
 *
 * @see <a href="https://en.wikipedia.org/wiki/Kalman_filter">Kalman Filter</a>
 * @see <a href="https://www.wouterbulten.nl/blog/tech/kalman-filters-explained-removing-noise-from-rssi-signals/">Kalman
 * Explained</a>
 * @see <a href="https://github.com/fgroch/beacon-rssi-resolver/blob/master/src/main/java/tools/blocks/filter/KalmanFilter.java">Example
 * Implementation</a>
 */
  constructor (duration = null, maximumTimestamp = null) {
    /**
     * We use a low value for the process noise (i.e. 0.008). We assume that most of the noise is
     * caused by the measurements.
     **/
    this.DEFAULT_ARMA_FACTOR = 0.95;
    this.armaRssi = null;
    super(duration, maximumTimestamp);
  }

  filter(beacon) {
    var advertisingPackets = this.getRecentAdvertisingPackets(beacon);
    //use mean as initialization
    var rssiArray = new AdvertisingPacketUtil.getRssisFromAdvertisingPackets(advertisingPackets);
    this.armaRssi = new AdvertisingPacketUtil.calculateMean(rssiArray);
    var frequency = new AdvertisingPacketUtil.getPacketFrequency(advertisingPackets.size(), duration, timeUnit);
    var armaFactor = this.getArmaFactor(frequency);
    advertisingPackets.forEach(function (advertisingPacket) {
    //for (var advertisingPacket in advertisingPackets) {
      this.addMeasurement(advertisingPacket.getRssi(), armaFactor);
    });
    return this.getFilteredRssi();
  }

  addMeasurement(rssi, armaFactor) {
    this.armaRssi = this.armaRssi - (armaFactor * (this.armaRssi - rssi));
  }

  getFilteredRssi() {
    return this.armaRssi;
  }

  getArmaFactor(packetFrequency) {
    //TODO make more robust to different packet frequencies
    var armaFactor = this.DEFAULT_ARMA_FACTOR;
    if (packetFrequency > 6) {
        armaFactor = 0.1;
    } else if (packetFrequency > 5) {
        armaFactor = 0.25;
    } else if (packetFrequency > 4) {
        armaFactor = 0.5;
    }
    return armaFactor;
  }
  /*
      Getter & Setter
   */
}
module.exports = ArmaFilter;

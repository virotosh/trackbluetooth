const WindowFilter = require('./WindowFilter');
const AdvertisingPacketUtil = require('../../advertising/AdvertisingPacketUtil')
class KalmanFilter extends WindowFilter {
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
    super(duration, maximumTimestamp);
    this.PROCESS_NOISE_DEFAULT = 0.008;
    this.processNoise = this.PROCESS_NOISE_DEFAULT;
  }

  filter(beacon) {
    var advertisingPackets = this.getRecentAdvertisingPackets(beacon);
    var rssiArray = new AdvertisingPacketUtil().getRssisFromAdvertisingPackets(advertisingPackets);
    // console.log('length: '+rssiArray.length)
    // Measurement noise is set to a value that relates to the noise in the actual measurements
    // (i.e. the variance of the RSSI signal).
    var measurementNoise = new AdvertisingPacketUtil().calculateVariance(rssiArray);
    // used for initialization of kalman filter
    var meanRssi = new AdvertisingPacketUtil().calculateMean(rssiArray);
    //console.log(meanRssi);
    return this.calculateKalmanRssi(advertisingPackets, this.processNoise, measurementNoise, meanRssi);
  }

  calculateKalmanRssi(advertisingPackets, processNoise, measurementNoise, meanRssi) {
    var errorCovarianceRssi;
    var lastErrorCovarianceRssi = 1;
    var estimatedRssi = meanRssi;
    advertisingPackets.forEach(function (advertisingPacket) {
    //for (var advertisingPacket in advertisingPackets) {
      var kalmanGain = lastErrorCovarianceRssi / (lastErrorCovarianceRssi + measurementNoise);
      estimatedRssi = estimatedRssi + (kalmanGain * (advertisingPacket.getRssi() - estimatedRssi));
      errorCovarianceRssi = (1 - kalmanGain) * lastErrorCovarianceRssi;
      lastErrorCovarianceRssi = errorCovarianceRssi + processNoise;
    });
    return estimatedRssi;
  }

  /*
      Getter & Setter
   */

  getProcessNoise() {
    return this.processNoise;
  }

  setProcessNoise(processNoise) {
    this.processNoise = processNoise;
  }
}
module.exports = KalmanFilter;

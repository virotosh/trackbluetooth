/**
 *
 *
 * "The Mathematics Behind a Local Positioning System" http://inside.mines.edu/~whereman/talks/TurgutOzal-11-Trilateration.pdf
 */

// import com.lemmingapex.trilateration.NonLinearLeastSquaresSolver;
// import com.lemmingapex.trilateration.TrilaterationFunction;
// import com.nexenio.bleindoorpositioning.ble.beacon.Beacon;
// import com.nexenio.bleindoorpositioning.location.Location;
// import com.nexenio.bleindoorpositioning.location.projection.SphericalMercatorProjection;
//
// import org.apache.commons.math3.fitting.leastsquares.LeastSquaresOptimizer;
// import org.apache.commons.math3.fitting.leastsquares.LevenbergMarquardtOptimizer;
// import org.apache.commons.math3.linear.RealVector;
//
// import java.util.List;
const java = require("java");
java.classpath.push("./lib/jar/commons-math3-3.5.jar");
java.classpath.push("./src");
var TrilaterationFunction = java.import("com.lemmingapex.trilateration.TrilaterationFunction");
var NonLinearLeastSquaresSolver = java.import("com.lemmingapex.trilateration.NonLinearLeastSquaresSolver");
var LevenbergMarquardtOptimizer = java.import("org.apache.commons.math3.fitting.leastsquares.LevenbergMarquardtOptimizer");
var LeastSquaresOptimizer = java.import("org.apache.commons.math3.fitting.leastsquares.LeastSquaresOptimizer");
const SphericalMercatorProjection = require('./lib/location/projection/SphericalMercatorProjection')

class Multilateration {
  constructor (beacons = []) {
    this.ROOT_MEAN_SQUARE_NOT_SET = -1;
    this.beacons = beacons;
    this.location = null;
    this.deviation = 0.0; //float
    this.rootMeanSquare = this.ROOT_MEAN_SQUARE_NOT_SET; //double
    this.optimum = null; //private LeastSquaresOptimizer.Optimum optimum

  }
  getPositions(beacons) {
    var positions = [];
    var location = null;
    for (var i = 0; i<beacons.length; i++){
      positions[i] = [];
    }
    for (var beaconIndex = 0; beaconIndex < beacons.length; beaconIndex++) {
        location = beacons[beaconIndex].getLocation();
        positions[beaconIndex] = (new SphericalMercatorProjection()).locationToEcef(location);
    }
    return positions;
  }

  getDistances(beacons) {
    var distances = [];
    for (var beaconIndex = 0; beaconIndex < beacons.length; beaconIndex++) {
      distances[beaconIndex] = beacons[beaconIndex].getDistance() + 0.000001; // to double
    }
    return distances;
  }

  //public LeastSquaresOptimizer.Optimum findOptimum()
  findOptimum(positions = null, distances = null) {
    if (positions == null && distances == null){
      positions = this.getPositions(this.beacons);
      distances = this.getDistances(this.beacons);
    }
    //public static LeastSquaresOptimizer.Optimum findOptimum(double[][] positions, double[] distances)
    var trilaterationFunction = new TrilaterationFunction(positions, distances);
    var leastSquaresOptimizer = new LevenbergMarquardtOptimizer();
    var solver = new NonLinearLeastSquaresSolver(trilaterationFunction, leastSquaresOptimizer);
    return solver.solveSync();

  }

  getLocation(optimum=null) {
    if(optimum==null && this.location !=null){
      return this.location;
    }
    optimum = this.getOptimum();
    var centroid = optimum.getPointSync().toArraySync();
    var location = (new SphericalMercatorProjection()).ecefToLocation(centroid);
    location.setAccuracy(Math.sqrt(optimum.getRMSSync())); // TODO: evaluate if this is meaningful
    return location;
  }

  /**
   * Returns the maximum square root of the diagonal coefficients of the covariance matrix, as
   * provided by {@link LeastSquaresOptimizer.Optimum#getSigma(double)}.
   *
   * @see <a href="https://commons.apache.org/proper/commons-math/javadocs/api-3.4.1/org/apache/commons/math3/fitting/leastsquares/LeastSquaresProblem.Evaluation.html#getSigma(double)">LeastSquaresProblem.Evaluation
   * Documentation</a>
   */
  getDeviation(optimum = null) {
    if (this.deviation == 0 && optimum == null) {
      optimum = this.getOptimum();
    }
    //RealVector standardDeviation = optimum.getSigma(0);
    standardDeviation = optimum.getSigmaSync(0);
    var maximumDeviation = 0;
    for (var i=0; i<standardDeviation.toArraySync().sizeSync();i++) {
      var deviation = standardDeviation.toArraySync().getSync(i);
      maximumDeviation = Math.max(maximumDeviation, deviation);
    }
    return maximumDeviation;
  }

  getRMS(optimum=null) {
    if (optimum == null){
      optimum = this.getOptimum();
    }
    return optimum.getRMSSync();
  }

  /*
      Getter & Setter
   */

  // getRMS() {
  //   if (this.rootMeanSquare == this.ROOT_MEAN_SQUARE_NOT_SET) {
  //     this.rootMeanSquare = this.getRMS(this.getOptimum());
  //   }
  //   return rootMeanSquare;
  // }

  getBeacons() {
    return this.beacons;
  }

  // getDeviation() {
  //   if (this.deviation == 0) {
  //     deviation = this.getDeviation(this.getOptimum());
  //   }
  //   return deviation;
  // }

  getOptimum() {
    if (this.optimum == null) {
        this.optimum = this.findOptimum();
    }
    return this.optimum;
  }
}

module.exports = Multilateration;

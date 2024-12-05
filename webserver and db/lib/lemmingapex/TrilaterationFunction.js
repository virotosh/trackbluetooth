var java = require("java");
java.classpath.push("../../src");
java.classpath.push("/Users/kin/Downloads/beaconwithnodejs/lib/jar/commons-math3-3.5.jar");
var MultivariateJacobianFunction = java.import('org.apache.commons.math3.fitting.leastsquares.MultivariateJacobianFunction');
var Array2DRowRealMatrix = java.import('org.apache.commons.math3.linear.Array2DRowRealMatrix');
var ArrayRealVector = java.import('org.apache.commons.math3.linear.ArrayRealVector');
var RealMatrix = java.import('org.apache.commons.math3.linear.RealMatrix');
var RealVector = java.import('org.apache.commons.math3.linear.RealVector');
var Pair = java.import('org.apache.commons.math3.util.Pair');

//class TrilaterationFunction extends MultivariateJacobianFunction{
class TrilaterationFunction {
  /**
	 * Known positions of static nodes
	 */
	//protected final double positions[][];

	/**
	 * Euclidean distances from static nodes to mobile node
	 */
  constructor (positions = [], distances = []) {
    //super(positions, distances);
    this.epsilon = 0.0000007;
    //positions; // 2D array Need at least two positions
    //distances; // 1D array Need match number of positions
    if(positions.length < 2) {
			console.log("Need at least two positions.");
		}

		if(positions.length != distances.length) {
			console.log("The number of positions you provided, " + positions.length + ", does not match the number of distances, " + distances.length + ".");
		}

    for (var i = 0; i < distances.length; i++) {
      distances[i] = Math.max(distances[i], this.epsilon);
    }
    var positionDimension = positions[0].length;

    for (var i = 1; i < positions.length; i++) {
      if(positionDimension != positions[i].length) {
        console.log("The dimension of all positions should be the same.");
      }
    }

    this.positions = positions;
    this.distances = distances;
  }

  getDistances() {
		return this.distances;
	}

  getPositions() {
		return this.positions;
	}

	/**
	 * Calculate and return Jacobian function Actually return initialized function
	 *
	 * Jacobian matrix, [i][j] at
	 * J[i][0] = delta_[(x0-xi)^2 + (y0-yi)^2 - ri^2]/delta_[x0] at
	 * J[i][1] = delta_[(x0-xi)^2 + (y0-yi)^2 - ri^2]/delta_[y0] partial derivative with respect to the parameters passed to value() method
	 *
	 * @param point for which to calculate the slope
	 * @return Jacobian matrix for point
	 */
  //RealVector point
  jacobian(point) {
		var pointArray = point.toArraySync();

    //var jacobian = [];
    var jacobian = java.newArray("java.lang.Double", [java.newArray("java.lang.Double", [0.1])]);
		for (var i = 0; i < this.distances.length; i++) {
      console.log(jacobian[i])
			for (var j = 0; j < pointArray.length; j++) {
        console.log(jacobian[i][j])
				jacobian[i][j] = java.newDouble(2 * pointArray[j] - 2 * this.positions[i][j]);
			}
		}
    // var MyClass = java.import("wrapper.MyUtil");
    // var result = MyClass.getSync(jacobian);
    console.log(jacobian);
		return new Array2DRowRealMatrix(jacobian);
	}

  // Pair<RealVector, RealMatrix>
  // RealVector point
	value(point) {
	   // input
  	var pointArray = point.toArray();

  	// output
  	var resultPoint = [];

  	// compute least squares
  	for (var i = 0; i < this.distances.length; i++) {
  		resultPoint[i] = 0.0;
  		// calculate sum, add to overall
  		for (var j = 0; j < pointArray.length; j++) {
  			resultPoint[i] += (pointArray[j] - this.getPositions()[i][j]) * (pointArray[j] - this.getPositions()[i][j]);
  		}
  		resultPoint[i] -= (this.getDistances()[i]) * (this.getDistances()[i]);
  	}

  	jacobian = this.jacobian(point);
    //return java.newInstanceSync('org.apache.commons.math3.linear.Array2DRowRealMatrix', jacobian);
  	return new Pair(new ArrayRealVector(resultPoint), jacobian);
  }

}

module.exports = TrilaterationFunction;

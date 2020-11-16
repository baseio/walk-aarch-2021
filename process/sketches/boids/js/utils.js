/**
 * Returns a random int between a min and a max
 *
 * @param  int | min | A minimum number
 * @param  int | max | A maximum number
 * @return int | The random number in the given range
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns the distance between two coordinates
 *
 * @param  int | x1 | Point 1's x coordinate
 * @param  int | y1 | Point 1's y coordinate
 * @param  int | x2 | Point 2's x coordinate
 * @param  int | y2 | Point 2's y coordinate
 * @return int | The distance between points 1 and 2
 */
function getDistance(x1, y1, x2, y2) {
  var xDist = x2 - x1;
  var yDist = y2 - y1;
  return Math.sqrt( Math.pow(xDist, 2) + Math.pow(yDist, 2) );
}

/**
 * Get coefficients based on normal distribution
 *
 * @param  int | mean | The mean value of the data set
 * @param  int | stdev | The standard deviation for the data set
 * @return int | A number from the data set
 */
function gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }

       var retval = mean + stdev * y1;
       if(retval > 0)
           return retval;
       return -retval;
   }
}

if( Victor ){
	/**
	 * Add Limit Magnitude function to Victor objects
	 *
	 * @param  int | max | The limit magnitude for the vector
	 */
	Victor.prototype.limitMagnitude = function (max) {

	  if (this.length() > max) {
	    this.normalize();
	    this.multiply({x:max,y:max});
	  }

	};
}


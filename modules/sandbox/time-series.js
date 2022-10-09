// my go at predictions

// first try trend with one cycle
// then with two, three, four 
// - 24 hours of day, 7 days of week, 30.5 days of month, 12 months of year
// then missing data
// then manual tweaks
{
  // load all data - write as if it will run again on every new data point
  // year, month, number
  // data is monthly
  let data = [
    432, 390, 461, 508, 606, 622, 535, 472, 461, 419, 391, 417, 405, 362, 407, 463, 559, 548, 472, 420, 396, 
    406, 342, 360, 337, 310, 359, 404, 505, 491, 435, 363, 348, 362, 318, 340, 336, 305, 347, 404, 467, 465, 
    422, 355, 348, 356, 301, 315, 306, 271, 306, 355, 405, 413, 374, 318, 313, 317, 277, 284, 278, 237, 274, 
    312, 347, 364, 315, 270, 269, 267, 233, 242, 229, 203, 229, 259, 293, 302, 264, 234, 227, 235, 188, 204, 
    201, 180, 211, 237, 272, 264, 243, 229, 235, 236, 196, 196, 194, 172, 191, 209, 242, 230, 218, 183, 181, 
    193, 180, 171, 166, 146, 162, 184, 199, 199, 178, 172, 163, 178, 150, 145, 140, 114, 133, 158, 170, 170, 
    149, 125, 135, 141, 126, 115, 118, 104, 119, 136, 148, 148, 135, 121, 129, 132, 118, 112
  ];

  // make array of trends data for cycle period
  function makeTrend(period) {
    let weight = 1;
    const diminish = 0.9;
    let weightSum = 0;
    const tolerance = 0.05;
    let trends = new Array(period).fill(0);
    let cycleStart = 0;

    do {
      // make array of next cycle data
      if (cycleStart+period>data.length) {
        console.error("out of bounds");
        return trends;
      }
      console.log("cycleStart "+cycleStart);
      let cycle = data.slice(cycleStart,cycleStart+period);
      console.table(cycle);
      cycleStart += period;
      // make sum of cycle
      let sum = cycle.reduce((a,b)=>a+b);
      // console.log("sum "+sum);
      // console.log("weight "+weight);
      // console.log("weightSum "+weightSum);
      // console.log("w/weightSum "+weight/weightSum);
      // normalise array and multiply by reduction exponent factor
      // and add to trends array elements
      trends.forEach(function(e,i) {
        // console.log("e "+e+" i "+i+" cycle[i]"+cycle[i]);
        trends[i] += cycle[i]/sum*weight;
      });
      console.table(trends);
      // add to sum of reductions factors
      weightSum += weight;
      // iterate reduction exponent factor
      weight *= diminish;
    } while (weight/weightSum>tolerance) // if reductions factor more than tolerance loop
    let trendsSum = trends.reduce((a,b)=>a+b);
    return trends.map(e=>e/trendsSum);
  }

  let t = makeTrend(12);
  console.table(t);
}

/**
 * Scale a value that is known to be in a range to a new range
 * for instance map(50,0,100,1000,2000) will return 1500 as 50 is halfway between 0 and 100 and 1500 is halfway through 1000 and 2000
 * @param {Number} value value to map 
 * @param {Number} oldMin minimum value of the number 
 * @param {Number} oldMax maximum value of the number
 * @param {Number} newMin minimum value of the output
 * @param {Number} newMax maximum value of the output
 * @returns 
 */
export function map(value, oldMin, oldMax, newMin, newMax) {
    return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
}

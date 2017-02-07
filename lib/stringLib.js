// A collection of basic functions 

/**
 * Capitalizes the first letter of a string.
 */

exports.capStr = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Removes any line breaks from a string, but preserves spaces.
 */
exports.removeLineBreaks = (str) => {
  return String(str).replace(/\r?\n|\r/g, " ");
};

/**
 * Compile an array of strings into a single readable string list.
 * "Tomato or Cherry", "Tomato, Cherry, or Onion"
 */
exports.stringifyList = (arr) => {
  if (arr.length == 2)
    return `${arr[0]} or ${arr[1]}`;
  else { // meaning length is 3 or above
    let list = `${arr[0]}, `;
    for (let i = 1; i < arr.length - 1; i ++)
      list += `${arr[i]}, `;
    list += `or ${arr[arr.length - 1]}`;
    return list;
  }
};

/**
 * Pads a number so that it is three digits long, then returns
 * it as a string.
 */
exports.padNum3 = (num) => {
  num = String(num);
  return num[2] ? num : (num[1] ? `0${num}` : `00${num}`);
}
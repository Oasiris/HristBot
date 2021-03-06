const cPokedex = require('./pokedex');
const cInfo = require('./info');
const cCleverbot = require('./cleverbot');
const cUtility = require('./utility');

const allCommands = [cPokedex, cInfo, cCleverbot, cUtility];

var mergeCommands = (objectArr) => {
  var listOfCommands = {};
  for (var i = 0; i < objectArr.length; i ++) {
    for (let key in objectArr[i]) {
      listOfCommands[key] = objectArr[i][key];
    }
  }

  return listOfCommands;
}

module.exports = mergeCommands(allCommands);
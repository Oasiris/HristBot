const commandsPokedex = require('./pokedex');
const commandsInfo = require('./info');

const allCommands = [commandsPokedex, commandsInfo];

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
// HTTP request dependency
const request = require("request");

// Imported data JSONs
const simpleDex = require("./../data/simplePokedex-v1");

// Imported local libraries
const sLib = require("./../lib/stringLib");

// Global variables
const numLimit = 20;

const pokeapiHeaders = {

};

// Sample data:
// http://pokeapi.co/api/v2/pokemon-species/133/

/****************************************************/


module.exports = pokedexCommand = {
  
  "pokedex": {
    command: "pokedex",
    description: "Shows general information on a given Pokemon species.",
    usage: "<Pokemon name OR National Dex number>",
    process: (bot, oMsg, args) => {
      // Make sure input is valid
      if (args.length == 0) {
        oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, please supply either a Dex number or a Pokemon name.`);
        return;
      };

      getDexNumber(args[0], function(res, dexNum) {
        if (res) {
          oMsg.channel.sendMessage(res);
          return;
        }
        queryPokeapi(dexNum, function(err, data) {
          if (err) {
            console.log(err);
            oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, please supply a valid Pokedex ID. (Note that Sun/Moon pokemon are not yet available.)`); 
            return;
          }

          // If no error, data is valid, so get info.
          createPokedexEntry(data, function(info) {
            oMsg.channel.sendMessage(info);  
          });    
        })
      })
    } // ends process
  } // ends pokedex
} 


/****************************************************/
/* ORGANIZE DATA  ----------------------------------*/
/****************************************************/

/**
 * Organizes each part of the returned JSON data from Pokeapi into
 * a readable Pokedex entry. The callback is the completed entry in 
 * string form.
 */
var createPokedexEntry = (data, callback) => {

  // Assuming that actual data has been retrieved.
  data = JSON.parse(data);

  // Padding ID number
  let paddedId = sLib.padNum3(data.id);

  // Gender
  if (data.gender_rate == -1)
    var genderDetails = "Genderless";
  else {
    let femaleRate = Math.round(data.gender_rate / 8 * 1000) / 10;
    var genderDetails = `${100 - femaleRate}% male, ${femaleRate}% female`;
  }

  // Hatch steps
  let minHatch, maxHatch, hatchArray = new Array(4);
  hatchArray[0] = 256 * data.hatch_counter;
  hatchArray[1] = 256 * (data.hatch_counter + 1);
  hatchArray[2] = 255 * (data.hatch_counter + 1);
  hatchArray[3] = 257 * data.hatch_counter;
  hatchArray.sort((a, b) => a - b);
  minHatch = hatchArray[0];
  maxHatch = hatchArray[3];

  // Egg group
  if (data.egg_groups.length == 2)
    var eggGroupString = sLib.capStr(data.egg_groups[0].name) + " and " + sLib.capStr(data.egg_groups[1].name);
  else
    var eggGroupString = sLib.capStr(data.egg_groups[0].name);

  // Evolves-from
  if (data.evolves_from_species == null)
    var evolvesFromString = "Basic Pokemon";
  else
    var evolvesFromString = `Evolves from ${sLib.capStr(data.evolves_from_species.name)}`;

  // Generation
  let genString = `Generation ${data.generation.name.slice(11).toUpperCase()}`;

  // Pokedex entries
  let entriesString = "";
  let entriesArr = data.flavor_text_entries.filter((ele) => {return ele.language.name == "en" && (ele.version.name == "alpha-sapphire" || ele.version.name == "omega-ruby" || ele.version.name == "y" || ele.version.name == "x")});
  for (ele in entriesArr) {
    entry = sLib.removeLineBreaks(entriesArr[ele].flavor_text);
    if (entriesString.indexOf(entry) == -1) 
      entriesString += `"${entry}"\n`;
  }

  // Retrieve the remaining data (TYPE and EVOLUTION) via querySimpleDex()
  getTypeAndEvolutions(data.id, (err, typeString, evoToString) => {
    let info = `#${paddedId}`
         + "\n" + `${sLib.capStr(data.names[0].name)}`
         + "\n" + `${sLib.capStr(data.genera[0].genus)} Pokemon`
         + "\n" + `${typeString}-type Pokemon`
         + "\n" + `Color: ${sLib.capStr(data.color.name)}`
         + "\n" + `Body: ${sLib.capStr(data.shape.name)}`
         + "\n"
         + "\n" + evolvesFromString
         + `${(evoToString) ? "\n" + evoToString : ""}`
         + "\n" + `Introduced in ${genString}`
         + "\n" + `Found in ${sLib.capStr(data.habitat ? data.habitat.name : "unknown")} areas`
         + "\n"
         + "\n" + genderDetails
         + "\n" + `Catch rate: ${data.capture_rate}`
         + "\n" + `Hatch time: ${minHatch} - ${maxHatch} steps`
         + "\n" + `Leveling rate: ${sLib.capStr(data.growth_rate.name)}`
         + "\n" + `Base friendship: ${data.base_happiness}`
         + "\n" + `Egg Groups: ${eggGroupString}`
         + "\n"
         + "\n" + "Pokedex Entries:"
         + "\n" + entriesString;  
    callback(info);
  });
}


/****************************************************/
/* GET DATA       ----------------------------------*/
/****************************************************/

/** 
 * Queries the Pokeapi v2 API for Pokemon data based on Dex number.
 * Only returns data if data is valid (if response's status code is 200). 
 */
var queryPokeapi = (dexNum, callback) => {
  var options = {
    url: "http://pokeapi.co/api/v2/pokemon-species/" + dexNum,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'NPM Request for Oasiris\'s Discord Bot HristBot'
    }
  };
  request.get(options, function(err, res, body) {
    if (err)                        callback(err, null);
    else if (res.statusCode != 200) callback(res.statusCode, null);
    else                            callback(null, body);
  })
};


/**
 * Given a Pokemon's National Dex number, return the following data:
 * - String containing Pokemon type(s)
 * - String containing all evolutions and, if applicable, level of evolution
 */
var getTypeAndEvolutions = (id, callback) => {
  // Start by finding object that corresponds to ID
  var mon = simpleDex.filter((ele) => {
    return (id == ele.national_id);
  })[0];

  // Create type string
  let typeString;
  let evoToString;

  // Dual types show as "Type 1/Type 2"
  if (mon.types.length == 1)   typeString = `${sLib.capStr(mon.types[0])}`;
  else typeString = `${sLib.capStr(mon.types[0])}/${sLib.capStr(mon.types[1])}`;

  // Create evolution TO string
  if (mon.evolutions.length == 0)
    evoToString = null;

  else if (mon.evolutions.length == 1) {
    evoToString = `Evolves to ${mon.evolutions[0].to}`;
    if (mon.evolutions[0].method == "level_up")
      evoToString += ` at Level ${mon.evolutions[0].level}`;
  }
  else if (mon.evolutions.length >= 2) {
    let evoList = [];
    for (i in mon.evolutions)
      evoList.push(mon.evolutions[i].to);
    evoToString = `Evolves to ${sLib.stringifyList(evoList)}`;
  }

  // Callback
  callback(null, typeString, evoToString);
}


/**
 * Detects if input is a number or a string.
 * If it's a number, returns the number.
 * If it's a string (a Pokemon name), retrieves that Pokemon's corresponding
 * National Dex number according to the simplePokedex.
 */
var getDexNumber = (input, callback) => {
  // Use local Pokedex library to search for Pokemon.
  let tempDex = simpleDex;

  if (isNaN(input)) { // If not a num (if string)
    var pokemonName = input;
    console.log("NOT A NUM");
  }
  else { // If num
    callback(null, input);
    console.log("NUM");
    return;
  }

  tempDex = tempDex.filter((ele) => {
    return (ele.name.toLowerCase().indexOf(pokemonName.toLowerCase()) != -1);
  });

  console.log(tempDex.length, numLimit);

  // One result found (exact match).
  if (tempDex.length == 1) {
    callback(null, tempDex[0].national_id);
  }
  // No results found.
  else if (tempDex.length == 0) {
    var res = "I couldn't find that Pokemon. Check your spelling and try again.";
    callback(res, null);
  } 
  // There were multiple Pokemon that matched the name search.
  else if (tempDex.length > 1 && tempDex.length <= numLimit) {
    
    // If the strings match EXACTLY
    let perfectMatch = tempDex.filter((ele) => {
      return (ele.name.toLowerCase() == pokemonName.toLowerCase());
    })
    if (perfectMatch.length == 1) {
      callback(null, perfectMatch[0].national_id);
      return;
    }


    console.log("MULTIPLE!");
    var res = "Your query returned multiple results. See below:\n\n";
    for (p in tempDex) {
      let paddedId = sLib.padNum3(tempDex[p].national_id);
      res += `  • \`#${paddedId}\` ${tempDex[p].name}\n`;
    }
    res += "\nCheck your spelling and try again.";
    callback(res, null);
  }
  // There were too many Pokemon to count that matched the name search.
  else if (tempDex.length > numLimit) {
    console.log("TOO MANY!");
    let res = `more than ${numLimit} Pokemon match the query, "${pokemonName}". Please make your search more specific.`;
    callback(res, null);
  }

  return;
};


// Core dependencies
const Discord = require('discord.js');
const bot = new Discord.Client();
const authJson = require('./auth');
const token = authJson.token;

// Extra dependencies
const unirest = require("unirest");

// Imported data JSONs
const simpleDex = require("./data/simplePokedex-v1");

// Imported local libraries
const sLib = require("./lib/stringLib");

// Initialization and global variables
var newUsers = new Discord.Collection();
var myUsername;
var myFullUsername;
var myId;
var myPrefix = '$';

/****************************************************/
/* INITIALIZATION ----------------------------------*/
/****************************************************/

bot.on("ready", () => {
  myUsername = bot.user.username;
  myFullUsername = bot.user.username + '#' + bot.user.discriminator;
  myId = bot.user.id;

  console.log(`Log-in successful as user ${myUsername}, userstring ${myFullUsername}, and ID ${myId}.`);
  console.log(`Ready to server in ${bot.channels.size} channels on ${bot.guilds.size} servers, for a total of ${bot.users.size} users.`);
});

/****************************************************/
/* EVENTS (MESSAGE) --------------------------------*/
/****************************************************/

bot.on('message', (message) => {
  // Only continues if message has prefix & is by user
  let prefix = '`';
  if (!message.content.startsWith(prefix)) return;
  if(message.author.bot) return;  

  // Commands
  if (message.content === prefix + 'ping') {
    message.reply('pong');
  }

  else if (message.content.startsWith(prefix + 'ping2')) {
    message.channel.sendMessage('pong2!');
  }

  else if (message.content.startsWith(prefix + 'foo')) {
    message.channel.sendMessage('bar');
  }

  else if (message.content.startsWith(prefix + 'repeat ')) {
    message.channel.sendMessage(message.content.slice(8));
  }


  else if (message.content === prefix + 'what is my avatar') {
    // send the user's avatar URL
    message.reply(message.author.avatarURL);
  }
});

bot.on("guildMemberAdd", (member) => {
  newUsers.set(member.user.id, member.user);
});

/****************************************************/
/* EVENTS (MESSAGE 2) ------------------------------*/
/****************************************************/

bot.on('message', (msg) => {

  let prefix = myPrefix;
  // make sure the message has the proper prefix
  if (!msg.content.startsWith(prefix)) return;
  // make sure the message is not sent by the self or other bots
  if (msg.author.bot) return;

  // immediately log "the message author (username + discriminator) has triggered a message event! (message: ______)
  console.log(`[MESSAGE EVENT] ${msg.author.username}#${msg.author.discriminator} || Message: "${msg.content}"`);

  // split message by space and separate command from arguments.
  let cmdText = msg.content.split(" ")[0].slice(1).toLowerCase();
  var args;
  if (msg.content.split(" ").length > 1) {
    args = msg.content.split(" ").slice(1);
  }

  // Compile all commands into a list
  var listOfCommands = mergeCommands([commandsInfo, commandsRoles, commandsPokemon]);

  // SPECIAL COMMAND: "help" or "commands"
  if (cmdText == "help" || cmdText == "commands") {
    commandsHelp.help.process(bot, msg, listOfCommands);
    return;
  }

  // using the bot (Client) and the original message context, run the command.
  let cmd = listOfCommands[cmdText];
  if (!cmd) {
    msg.channel.sendMessage(`Sorry, I don't recognize this as a valid command: \`${cmdText}\`.`);
  } else {
    cmd.process(bot, msg, args);
  }


});



/****************************************************/
/* LIST OF COMMANDS --------------------------------*/
/****************************************************/
// All commands are in lowercase. Inputs will be converted to lowercase.

var commandsHelp = {  
  "help": {
    description: "Displays every other command with a helpful description.",
    process: (bot, oMsg, listOfCommands) => {
      var res = "Here's all of the commands I have:\n\n";
      for (c in listOfCommands) {
        // If the command has a "usage" key, spit that out too.
        // Example: '  • @Aqua servers - Lists servers this bot is currently connected to.'a
        var usage = listOfCommands[c].usage;
        if (!usage) usage = "";
        else usage = " " + usage;

        var desc = listOfCommands[c].description;
        if (!desc) desc = "";
        else desc = "- " + desc;

        res += `  • \`${myPrefix}${c}${usage}\` ${desc}\n`;
      } // end for loop
      oMsg.channel.sendMessage(res);
      return;
    }
  }



};


// *********************************************************************************


var commandsInfo = {
  "who": {
    description: "Bot introduces themselves.",
    process: (bot, oMsg) => {
      oMsg.channel.sendMessage(`Hi. My full name is ${bot.user.username}#${bot.user.discriminator}, but you can call me ${bot.user.username}.`);
      return;
    }
  },

  "id": {
    description: "Return the ID, either of the specified user or of the message author.",
    process: (bot, oMsg) => {
      oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, your user ID is ${oMsg.author.id}.`);
      return;
    }
  },

  "nickname": {
    description: "Return the nickname of the message author.",
    process: (bot, oMsg) => {
      let nickname = getNickname(oMsg.author.id, oMsg.guild);
      if (!nickname) {
        oMsg.channel.sendMessage(`${oMsg.author.username}, you don't appear to have a nickname on this guild!`);
      } else {
        oMsg.channel.sendMessage(`${oMsg.author.username}, your nickname on this server seems to be ${nickname}!`);
      }

      return;
    }
  },

  "abeljohn": {
    description: "Summon an image of our leader and savior, Abel John Jacob.",
    process: (bot, oMsg) => {
      let imageUrl = "http://i.imgur.com/JqKzbUw.jpg";
      oMsg.channel.sendMessage(imageUrl);

      return;
    }
  },

  "setprefix": {
    description: "Change the prefix used to summon the bot. Must be 1 character. Default is $.",
    usage: "<newprefix>",
    process: (bot, oMsg, args) => {
      if (args.length != 1 || args[0].length != 1) {
        oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, you must specify exactly one 1-character prefix.`);
      } else {
        oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, my command prefix is now ${args[0]}.`);
        myPrefix = args[0];
      }

      return;
    }
  },


};

/*
guild.roles.map((roleObject) => {



return roleObject;
});

check for:
hoist
members (in collection form)
name
position
mentionable
permissions
*/


var commandsRoles = {
  "showmypermissions": {
    description: "Lists the Permissions object of the author user.",
    usage: "",
    process: (bot, oMsg, args) => {
      console.log(oMsg.member.permissions);
      return;
    }
  }
}
// *********************************************************************************

var commandsPokemon = {

  "pokedex": {
    description: "Shows general information on a given Pokemon species.",
    usage: "<Pokemon name OR National Dex number>",
    process: (bot, oMsg, args) => {

      // Make sure input is valid
      if (args.length == 0) {
        oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, please supply either a Dex number or a Pokemon name.`);
        return;
      };

      var promise = new Promise(function(fulfill, reject) {
        if (!isNaN(args[0]))     // If input is a number
          fulfill(args[0]);  
        else {                   // If input is name query
          getDexNumber(args[0], function(res, dexNumber) {
            if (res) reject(res);
            else fulfill(dexNumber);
          });
        };
      });

      promise.then((id) => {
        queryPokeapi('http://pokeapi.co/api/v2/pokemon-species/' + id, function(data) {
          // Error handling
          if (!data || data.detail == "Not found.") {
            oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, please supply a valid Pokedex ID. (Note that Sun/Moon pokemon are not yet available.)`); 
            return;
          }

          // Padding the ID Number
          data.id = String(data.id);
          let paddedId = data.id[2] ? data.id : (data.id[1] ? `0${data.id}` : `00${data.id}`);

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
          querySimpleDex(data.id, (err, typeString, evoToString) => {
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

            oMsg.channel.sendMessage(info);                    
          });        
        });
      }, (res) => {
        console.log("at this point res is " + res);
        oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, ${res}`);
      });
    } // ends process
  },


};

/****************************************************/
/* HELPER FUNCTIONS: AQI/LIBRARY QUERIES -----------*/
/****************************************************/


var queryPokeapi = (url, callback) => {
  let Request = unirest.get(url);
  Request.header({
    'Accept': 'application/json',
    'User-Agent': 'Unirest Node.js for Oasiris\'s Discord HristBot'
  })
  .end((res) => {
    var data = res.body;
    if (data)  callback(data);
    else       callback(null);
  })
}


/**
 * Given a Pokemon's National Dex number, return the following data:
 * - String containing Pokemon type(s)
 * - String containing all evolutions and, if applicable, level of evolution
 */
var querySimpleDex = (id, callback) => {
  // Start by finding object that corresponds to ID
  var mon = simpleDex.filter((ele) => {
    return (id == ele.national_id);
  })[0];

  // Create type string
  let typeString;
  let evoToString;

  if (mon.types.length == 1)   typeString = `${sLib.capStr(mon.types[0])}`;
  else                         typeString = `${sLib.capStr(mon.types[0])}/${sLib.capStr(mon.types[1])}`;

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

  callback(null, typeString, evoToString);
}



/****************************************************/
/* HELPER FUNCTIONS: LOW-LEVEL ---------------------*/
/****************************************************/


/**
 * Given a Discord User ID and a Guild object, returns that User's 
 * nickname in that Guild.
 */
var getNickname = (str, guild) => {
  str = String(str);
  if (str.trim().length != 18) return;
  return guild.members.get(str).nickname;
};


/**
 * Accepts an array of multiple commands lists and merges them into 
 * a single list.
 */
var mergeCommands = (argArray) => {
  var listOfCommands = {};
  for (var i = 0; i < argArray.length; i ++) {
    for (let key in argArray[i]) {
      listOfCommands[key] = argArray[i][key];
    }
  }

  return listOfCommands;
}


/**
 * Given the name of a Pokemon, retrieves that Pokemon's corresponding
 * National Dex number according to the simplePokedex.
 */
var getDexNumber = (pokemonName, callback) => {
  let tempDex = simpleDex;
  tempDex = tempDex.filter((ele) => {
    return (ele.name.toLowerCase().indexOf(pokemonName.toLowerCase()) != -1);
  });

  if (tempDex.length == 1) {
    callback(null, tempDex[0].national_id);
  }
  else if (tempDex.length == 0) {
    var res = "I couldn't find that Pokemon. Check your spelling and try again.";
    callback(res, null);
  } 
  else if (tempDex.length > 1 && tempDex.length <= 10) {
    var res = "your query returned multiple results. See below:\n\n";
    for (p in tempDex)
      res += `  • ${tempDex[p].name}\n`;
    res += "\nCheck your spelling and try again.";
    callback(res, null);
  }
  else if (tempDex > 10) {
    var res = `more than 10 Pokemon match the query, "${pokemonName}". Please make your search more specific.`;
    callback(res, null);
  }

  return;
};


/****************************************************/
/* SERVER LOGIN   ----------------------------------*/
/****************************************************/


bot.login(token); 
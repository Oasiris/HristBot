

const Discord = require('discord.js');
const bot = new Discord.Client();

const authJson = require('./auth.json');
const token = authJson.token;
const unirest = require("unirest");

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

  // using the bot (Client) and the original message context, run the command.
  let cmd = commandsInfo[cmdText];
  if (!cmd) {
    msg.channel.sendMessage(`Sorry, I don't recognize this as a valid command: \`${cmdText}\`.`);
  } else {
    cmd.process(bot, msg, args);
  }


});



/****************************************************/
/* EVENTS (DISCONNECTION) --------------------------*/
/****************************************************/
// All commands are in lowercase. Inputs will be converted to lowercase.

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
        oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, you don't appear to have a nickname on this guild!`);
      } else {
        oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, your nickname on this server seems to be ${nickname}!`);
      }

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

  "pokedex": {
    description: "Search the pokedex for a pokemon species based on dex number.",
    usage: "<National Dex number>",
    process: (bot, oMsg, args) => {
      // Make sure input is valid
      if (args.length < 1 || isNaN(args[0])) {
        oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, :writing_hand: :1234:`);
        return;
      }

      var RequestPokeapi = unirest.get("http://pokeapi.co/api/v2/pokemon-species/" + args[0]);

      RequestPokeapi.header({
        'Accept': 'application/json',
        'User-Agent': 'Unirest Node.js for Oasiris\'s Discord HristBot'
      })
      .end((res) => {
        var data = res.body;
        var info;

        if (!data || data.detail == "Not found.") {
          oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, please supply a valid Pokedex ID. Note that Sun/Moon pokemon are not yet available!`); 
          return;
        }

        // Some pre-processing to keep code organized
        // Padding the ID
        data.id = String(data.id);
        var paddedId = data.id[2] ? data.id : (data.id[1] ? `0${data.id}` : `00${data.id}`);

        // Gender
        var genderDetails;
        if (data.gender_rate == -1)
          genderDetails = "Genderless";
        else {
          var femaleRate = Math.round(data.gender_rate / 8 * 1000) / 10;
          var maleRate = 100 - femaleRate;
          genderDetails = `${maleRate}% male, ${femaleRate}% female`;
        }

        // Hatch steps
        var minHatch, maxHatch, hatchArray = new Array(4);
        hatchArray[0] = 256 * data.hatch_counter;
        hatchArray[1] = 256 * (data.hatch_counter + 1);
        hatchArray[2] = 255 * (data.hatch_counter + 1);
        hatchArray[3] = 257 * data.hatch_counter;
        hatchArray.sort((a, b) => a - b);
        minHatch = hatchArray[0];
        maxHatch = hatchArray[3];

        // Egg group
        var eggGroupString;
        if (data.egg_groups.length == 2)
          eggGroupString = capStr(data.egg_groups[0].name) + " and " + capStr(data.egg_groups[1].name);
        else 
          eggGroupString = capStr(data.egg_groups[0].name);

        // Evolves-from
        var evolvesFromString;
        if (data.evolves_from_species == null)
          evolvesFromString = "Basic Pokemon";
        else
          evolvesFromString = `Evolves from ${capStr(data.evolves_from_species.name)}`;

        // generation-i --> Generation I
        var genNumeral = data.generation.name.slice(11).toUpperCase();

        // Pokedex entries.
        var entriesString = "";
        var flavorTextArr = data.flavor_text_entries;
        flavorTextArr = flavorTextArr.filter((ele) => {return (ele.language.name == "en" && (ele.version.name == "alpha-sapphire" || ele.version.name == "omega-ruby" || ele.version.name == "y" || ele.version.name == "x"))});
        // console.log(flavorTextArr);

        // console.log(flavorTextArr[1].flavor_text);
        // console.log(entriesString.indexOf(flavorTextArr[1].flavor_text));

        for (ele in flavorTextArr) {
          entry = removeLineBreaks(flavorTextArr[ele].flavor_text);
          if (entriesString.indexOf(entry) == -1) {
            entriesString += '"' + entry + '"\n';
          }
        }

        info = `#${paddedId}`
             + "\n" + `${capStr(data.names[0].name)}`
             + "\n" + `${capStr(data.genera[0].genus)} Pokemon`
             + "\n" + `Color: ${capStr(data.color.name)}`
             + "\n" + `Body: ${capStr(data.shape.name)}`
             + "\n"
             + "\n" + evolvesFromString
             + "\n" + `Introduced in Generation ${genNumeral}`
             + "\n" + `Found in ${capStr(data.habitat ? data.habitat.name : "unknown")} areas`
             + "\n"
             + "\n" + genderDetails
             + "\n" + `Catch rate: ${data.capture_rate}`
             + "\n" + `Hatch time: ${minHatch} - ${maxHatch} steps`
             + "\n" + `Leveling rate: ${capStr(data.growth_rate.name)}`
             + "\n" + `Base friendship: ${data.base_happiness}`
             + "\n" + `Egg Groups: ${eggGroupString}`
             + "\n"
             + "\n" + "Pokedex Entries:"
             + "\n" + entriesString;

        oMsg.channel.sendMessage(info);
      });

      return;
    }
  },


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





}

/****************************************************/
/* HELPER COMMANDS ---------------------------------*/
/****************************************************/

// Given a user ID, returns the guild nickname.
var getNickname = (str, guild) => {
  str = String(str);
  if (str.trim().length != 18) return;
  return guild.members.get(str).nickname;
};

var capStr = (str) => str.charAt(0).toUpperCase() + str.slice(1);

var removeLineBreaks = (str) => {
  return String(str).replace(/\r?\n|\r/g, " ");
};

/****************************************************/
/* SERVER LOGIN   ----------------------------------*/
/****************************************************/

bot.login(token); 

// Core dependencies
const Discord = require('discord.js');
const bot = new Discord.Client();
const authJson = require('./auth');
const token = authJson.token;

// Imported data JSONs
const simpleDex = require("./data/simplePokedex-v1");

// Imported local libraries
const sLib = require("./lib/stringLib");

// Imported COMMANDS. The backbone of the entire bot!
const listOfCommands = require("./commands/");

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

  // Remember, listOfCommands was retrieved from /commands/ during
  // initial declaration.

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
/* SPECIAL COMMANDS --------------------------------*/
/****************************************************/
// All commands are in lowercase. Inputs will be converted to lowercase so
// command name and input will match properly.

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


/****************************************************/
/* SERVER LOGIN   ----------------------------------*/
/****************************************************/


bot.login(token); 
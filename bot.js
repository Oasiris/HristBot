

const Discord = require('discord.js');
const bot = new Discord.Client();

const authJson = require('./auth.json');
const token = authJson.token;

var newUsers = new Discord.Collection();



var myUsername;
var myFullUsername;
var myId;

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

  let prefix = '$';
  // make sure the message has the proper prefix
  if (!msg.content.startsWith(prefix)) return;
  // make sure the message is not sent by the self or other bots
  if (msg.author.bot) return;

  // immediately log "the message author (username + discriminator) has triggered a message event! (message: ______)
  console.log(`[MESSAGE EVENT] ${msg.author.username}#${msg.author.discriminator} || Message: "${msg.content}"`);

  // split message by space and separate command from arguments.
  let cmdText = msg.content.split(" ")[0].slice(1).toLowerCase();
  let args;
  if (msg.content.split(" ").length > 1) {
    let args = msg.content.split(" ").slice(1);
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
      oMsg.channel.sendMessage(`${oMsg.author.username}, your user ID is ${oMsg.author.id}.`);
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
  }


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


/****************************************************/
/* SERVER LOGIN   ----------------------------------*/
/****************************************************/

bot.login(token); 

module.exports = {
  "who": {
    description: "Bot introduces themselves.",
    process: (bot, oMsg) => {
      oMsg.channel.sendMessage(`Hi. My full name is ${bot.user.username}#${bot.user.discriminator}, but you can call me ${bot.user.username}.`);
      return;
    }
  },

  "id": {
    description: "Displays the ID, either of the specified user or of the message author.",
    process: (bot, oMsg, args) => {
      if (args.length == 0) { // Return ID of message author
        oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, your user ID is ${oMsg.author.id}.`);
        return;
      } else { // A user has been specified.
        let input = args[0];
        // If username with discriminator
        if (input[0] == '<' && input.length == 21) {
          oMsg.channel.sendMessage(`<@!${oMsg.author.id}>, that user's ID is ${input.slice(2, 20)}.`);
          return;
        }
      }
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


/****************************************************/
/* MAIN COMMAND FUNCTIONS --------------------------*/
/****************************************************/



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
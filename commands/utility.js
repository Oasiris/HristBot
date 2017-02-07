
module.exports = {
  "wordcount": {
    description: "Gets the word count of the entered phrase.",
    process: (bot, oMsg, args) => {
      if (!args) oMsg.channel.sendMessage(`Proper usage: \`$wordcount <phrase>\``);
      else {
        let message = "";
        let totalString = args.join(' ');

        message += "`" + totalString + "`" + "\n\n";
        message += `Word count: ${args.length}`;
        message += `\nCharacter count: ${totalString.length}`;

        oMsg.channel.sendMessage(message);
      }
      return;
    }
  }
}
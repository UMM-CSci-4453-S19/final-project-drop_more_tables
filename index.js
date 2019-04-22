const Discord = require('discord.js')
mysql = require('mysql')
credentials = require('./credentials.json')
const rp = require('request-promise')

credentials.database = "create_tables"
credentials.host = 'ids.morris.umn.edu'
const bot = new Discord.Client()
var prefix = "!pd"

bot.login(credentials.botid)

bot.on('ready', function () {
	console.log('The bot is online!')
	bot.user.setActivity(`playing pokemon in ${bot.guilds.size} servers`)
})

bot.on('message', function (msg) {
	if (msg.content.startsWith(prefix)) {
		msgcon = msg.content.toLowerCase()
		const args = msgcon.slice(prefix.length).trim().split(/ +/g)
		console.log(args)
		if (args[0] === "pokemon" && args[1]) {
			//msg.channel.send("http://play.pokemonshowdown.com/sprites/xyani/" + args[1] + ".gif")
      check404(msg, args[1]);
		}
    if (args[0] === "shiny" && args[1]){
      msg.channel.send("http://play.pokemonshowdown.com/sprites/xyani-shiny/" + args[1] + ".gif")
    }
	}
})

function check404(msg, pokemon){
  const options = {
    uri: "http://play.pokemonshowdown.com/sprites/xyani/" + pokemon + ".gif"
  }

  rp(options)
    .then(($) => {
        msg.channel.send("http://play.pokemonshowdown.com/sprites/xyani/" + pokemon + ".gif")
    }).catch((err) => {
      msg.channel.send("Pokemon not found")
    })
}

const Discord = require('discord.js')
mysql = require('mysql')
var _ = require('underscore')
credentials = require('./credentials.json')
const rp = require('request-promise')
port = process.env.PORT || 1337;
var async = require("async");
//const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor

credentials.database = "create_tables"
credentials.host = 'ids.morris.umn.edu'; //setup database credentials

var connection = mysql.createConnection(credentials); // setup the connection

connection.connect(function (err) { if (err) { console.log(err) } });

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

		if (args[0] === "help") {
			var embdmsg = new Discord.RichEmbed()
				.setTitle("Commands")
				.addField("Pokemon", "Get a pokemon specified by it's name, it's associated stats, and a gif of the Pokemon")
				.addField("Syntax:", "!pd pokemon [name]")
				.addField("Shiny:", "Same as Pokemon, but sends a gif of the shiny version")
				.addField("Syntax:", "!pd shiny [name]")
				.addField("Moves:", "Returns a list of the moves that a specified pokemon can learn, by default returns 10 random moves")
				.addField("Syntax:", "!pd moves [name] [numberOfMovesToReturn/all]");
			msg.channel.send(embdmsg);
		}
		if (args[0] === "pokemon" && args[1]) {
			var pokemon = args[1];
			if (pokemon == "alolan" || pokemon == "alola" && args[2]) {
				pokemon = args[2] + "-alola"

			} else if (pokemon == "deoxys" && args[2]) {
				pokemon = args[1] + "-" + args[2]
			} else if (pokemon == "deoxys") {
				pokemon = args[1] + "-normal"
			} else if (pokemon == "mega" && args[2]) {
				pokemon = args[2] + "-mega"
			}
			pokemoninfo(msg, pokemon, "");
		}

		if (args[0] === "moves" && args[1]) {
			if (args[2] && args[2].toLowerCase() == "all") {
				var info = '';
				pokemon = args[1];
				pokemongeninfo(msg, pokemon, function (result) {
					info = result;
					allMoves(msg, info, function (result) {
						sendmoves(msg, info, result);
					});
				});
			} else if (args[2] && isNumeric(args[2])) {
				pokemon = args[1];
				var info = '';
				pokemongeninfo(msg, pokemon, function (result) {
					info = result;
					limitedMoves(msg, info, parseInt(args[2]), function (result) {
						sendmoves(msg, info, result);
					})
				})
			} else {
				var pokemon = args[1];
				var x = 3;
				var info = '';
				var abilityinfo = '';

				pokemongeninfo(msg, pokemon, function (result) {
					info = result;
					limitedMoves(msg, info, 10, function (result) {
						sendmoves(msg, info, result);
					})
				})
			}
		}

		if (args[0] === "shiny" && args[1]) {
			var pokemon = args[1];
			if (pokemon == "alolan" || pokemon == "alola" && args[2]) {
				pokemon = args[2] + "-alola"
			} else if (pokemon == "deoxys") {
				pokemon = args[1] + "-attack"
			} else if (pokemon == "deoxys" && args[2]) {
				pokemon = args[1] + "-" + args[2]
			} else if (pokemon == "deoxys") {
				pokemon = args[1] + "-normal"
			} else if (pokemon == "mega" && args[2]) {
				pokemon = args[2] + "-mega"
			} else if (pokemon == "mega" && args[2]) {
				pokemon = args[2] + "-mega"
			}
			pokemoninfo(msg, pokemon, "shiny");
		}
	}
})

function pokemoninfo(msg, pokemon, shiny) {
	var x = 3;
	var info = '';
	var abilityinfo = '';
	var abilities = '';
	var stats = '';
	var types = '';
	var eff = '';
	pokemongeninfo(msg, pokemon, function (result) {
		info = result;
		pokemonabilitiesinfo(msg, info, info.id, function (result) {
			var abilityinfo = result
			geteachability(msg, info, abilityinfo, function (result) {
				abilities = result
				pokemonstatinfo(msg, info, abilities, function (result) {
					stats = result
					pokemontypeinfo(msg, info, abilities, stats, function (result) {
						types = result
						//sendpokemon(msg, info, abilities, stats, result, shiny);
						effagain(msg, info, abilities, stats, types, shiny, function (result) {
							//console.log(result)
							eff = result
							console.log(result)
							resagain(msg, info, abilities, stats, types, shiny, eff, function (result) {
								console.log(result)
								sendpokemon(msg, info, abilities, stats, types, shiny, eff, result);
							})
						})
					})
				})
			})
		})
	})
}

function effagain(msg, info, abilities, stats, types, shiny, callback) {
	var sql = 'SELECT * FROM type_efficacy where';
	var type = new Array(types.length)
	if (types.length = 2) {
		var sql = 'SELECT * FROM type_efficacy where damage_type = ? or damage_type = ?';
	} else if (types.length = 1) {
		var sql = 'SELECT * FROM type_efficacy where damage_type = ?';
	}

	connection.query(sql, types, function (err, rows, fields) {
		var dbfarr = {
			"normal": 0,
			"fighting": 0,
			"flying": 0,
			"poison": 0,
			"ground": 0,
			"rock": 0,
			"bug": 0,
			"ghost": 0,
			"steel": 0,
			"fire": 0,
			"water": 0,
			"grass": 0,
			"electric": 0,
			"psychic": 0,
			"ice": 0,
			"dragon": 0,
			"dark": 0,
			"fairy": 0
		}
		// Loop over the response rows and put the information into an array of maps
		// We can then use this to create our buttons

		rows.forEach(function (item, index) {
			var target = item.target_type
			switch (target) {
				case "normal":
					dbfarr.normal = dbfarr.normal + item.damage_factor
					break;
				case "fighting":
					dbfarr.fighting = dbfarr.fighting + item.damage_factor
					break;
				case "flying":
					dbfarr.flying = dbfarr.flying + item.damage_factor
					break;
				case "poison":
					dbfarr.poison = dbfarr.poison + item.damage_factor
					break;
				case "ground":
					dbfarr.ground = dbfarr.ground + item.damage_factor
					break;
				case "rock":
					dbfarr.rock = dbfarr.rock + item.damage_factor
					break;
				case "bug":
					dbfarr.bug = dbfarr.bug + item.damage_factor
					break;
				case "ghost":
					dbfarr.ghost = dbfarr.ghost + item.damage_factor
					break;
				case "steel":
					dbfarr.steel = dbfarr.steel + item.damage_factor
					break;
				case "fire":
					dbfarr.fire = dbfarr.fire + item.damage_factor
					break;
				case "water":
					dbfarr.water = dbfarr.water + item.damage_factor
					break;
				case "grass":
					dbfarr.grass = dbfarr.grass + item.damage_factor
					break;
				case "electric":
					dbfarr.electric = dbfarr.electric + item.damage_factor
					break;
				case "psychic":
					dbfarr.psychic = dbfarr.psychic + item.damage_factor
					break;
				case "ice":
					dbfarr.ice = dbfarr.ice + item.damage_factor
					break;
				case "dragon":
					dbfarr.dragon = dbfarr.dragon + item.damage_factor
					break;
				case "dark":
					dbfarr.dark = dbfarr.dark + item.damage_factor
					break;
				case "fairy":
					dbfarr.fairy = dbfarr.fairy + item.damage_factor
					break;
				default:
					console.log("type not found")
			}
		});
		//console.log(dbfarr[0])
		if (err) {
			console.log("We have an error:");
			console.log(err);
		}
		return callback(dbfarr)
	});
}

function resagain(msg, info, abilities, stats, types, shiny, eff, callback) {
	var sql = 'SELECT * FROM type_efficacy where';
	if (types.length = 2) {
		var sql = 'SELECT * FROM type_efficacy where target_type = ? or target_type = ?';
	} else if (types.length = 1) {
		var sql = 'SELECT * FROM type_efficacy where target_type = ?';
		if (args[0] === "moves" && args[1]) {
			if (args[2] && args[2].toLowerCase() == "all") {
				var info = '';
				pokemon = args[1];
				pokemongeninfo(msg, pokemon, function (result) {
					info = result;
					allMoves(msg, info, function (result) {
						sendmoves(msg, info, result);
					});
				});
			} else if (args[2] && isNumeric(args[2])) {
				pokemon = args[1];
				var info = '';
				pokemongeninfo(msg, pokemon, function (result) {
					info = result;
					limitedMoves(msg, info, parseInt(args[2]), function (result) {
						sendmoves(msg, info, result);
					})
				})
			} else {
				var pokemon = args[1];
				var x = 3;
				var info = '';
				var abilityinfo = '';

				pokemongeninfo(msg, pokemon, function (result) {
					info = result;
					limitedMoves(msg, info, 10, function (result) {
						sendmoves(msg, info, result);
					})
				})
			}
		}
		if (args[0] === "shiny" && args[1]) {
			msg.channel.send("http://play.pokemonshowdown.com/sprites/xyani-shiny/" + args[1] + ".gif")
		}
	}

	connection.query(sql, types, function (err, rows, fields) {
		var dbfarr = {
			"normal": 0,
			"fighting": 0,
			"flying": 0,
			"poison": 0,
			"ground": 0,
			"rock": 0,
			"bug": 0,
			"ghost": 0,
			"steel": 0,
			"fire": 0,
			"water": 0,
			"grass": 0,
			"electric": 0,
			"psychic": 0,
			"ice": 0,
			"dragon": 0,
			"dark": 0,
			"fairy": 0
		}
		// Loop over the response rows and put the information into an array of maps
		// We can then use this to create our buttons

		rows.forEach(function (item, index) {
			var target = item.damage_type
			switch (target) {
				case "normal":
					dbfarr.normal = dbfarr.normal + item.damage_factor
					break;
				case "fighting":
					dbfarr.fighting = dbfarr.fighting + item.damage_factor
					break;
				case "flying":
					dbfarr.flying = dbfarr.flying + item.damage_factor
					break;
				case "poison":
					dbfarr.poison = dbfarr.poison + item.damage_factor
					break;
				case "ground":
					dbfarr.ground = dbfarr.ground + item.damage_factor
					break;
				case "rock":
					dbfarr.rock = dbfarr.rock + item.damage_factor
					break;
				case "bug":
					dbfarr.bug = dbfarr.bug + item.damage_factor
					break;
				case "ghost":
					dbfarr.ghost = dbfarr.ghost + item.damage_factor
					break;
				case "steel":
					dbfarr.steel = dbfarr.steel + item.damage_factor
					break;
				case "fire":
					dbfarr.fire = dbfarr.fire + item.damage_factor
					break;
				case "water":
					dbfarr.water = dbfarr.water + item.damage_factor
					break;
				case "grass":
					dbfarr.grass = dbfarr.grass + item.damage_factor
					break;
				case "electric":
					dbfarr.electric = dbfarr.electric + item.damage_factor
					break;
				case "psychic":
					dbfarr.psychic = dbfarr.psychic + item.damage_factor
					break;
				case "ice":
					dbfarr.ice = dbfarr.ice + item.damage_factor
					break;
				case "dragon":
					dbfarr.dragon = dbfarr.dragon + item.damage_factor
					break;
				case "dark":
					dbfarr.dark = dbfarr.dark + item.damage_factor
					break;
				case "fairy":
					dbfarr.fairy = dbfarr.fairy + item.damage_factor
					break;
				default:
					console.log("type not found")
			}
		});
		//console.log(dbfarr[0])
		if (err) {
			console.log("We have an error:");
			console.log(err);
		}
		return callback(dbfarr)
	});

}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function allMoves(msg, info, callback) {
	var sql = 'SELECT distinct identifier from new_moves where pokemon_id = ?';
	connection.query(sql, info.id, function (err, rows, fields) {
		var dbfarr = new Array(rows.length);
		// Loop over the response rows and put the information into an array of maps
		// We can then use this to create our buttons

		rows.forEach(function (item, index) {
			dbfarr[index] = { "identifier": item.identifier };
		});
		if (err) {
			console.log("We have an error:");
			console.log(sql);
			console.log(err);
		}
		return callback(dbfarr)
	});
}

function limitedMoves(msg, info, count, callback) {
	var sql = 'SELECT DISTINCT identifier FROM new_moves WHERE pokemon_id=? ORDER BY RAND() LIMIT ?';
	var insertedValues = [info.id, count];

	connection.query(sql, insertedValues, function (err, rows, field) {
		var dbfarr = new Array(rows.length);

		rows.forEach(function (item, index) {
			dbfarr[index] = { "identifier": item.identifier };
		});
		if (err) {
			console.log("We have an error:");
			console.log(sql);
			console.log(err);
		}

		return callback(dbfarr);
	})
}

function check404(msg, pokemon) {
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

function pokemongeninfo(msg, pokemon, callback) {
	var sql = 'SELECT * FROM pokemon where stat_identifier = ?';
	connection.query(sql, pokemon, function (err, rows, fields) {
		var dbfarr = new Array(rows.length);
		// Loop over the response rows and put the information into an array of maps
		// We can then use this to create our buttons

		rows.forEach(function (item, index) {
			dbfarr[index] = {
				"name": item.stat_identifier,
				"species_id": item.species_id,
				"id": item.id
			};
		});
		//console.log(dbfarr[0])
		if (err) {
			console.log("We have an error:");
			console.log(err);
		}
		return callback(dbfarr[0])
	});
}

function pokemonstatinfo(msg, info, abilities, callback) {
	var sql = 'SELECT * FROM pokemon_stats where pokemon_id = ?';
	connection.query(sql, info.id, function (err, rows, fields) {
		var dbfarr = new Array(rows.length);
		// Loop over the response rows and put the information into an array of maps
		// We can then use this to create our buttons

		rows.forEach(function (item, index) {
			dbfarr[index] = {
				"base_stat": item.base_stat,
				"identifier": item.identifier
			};
		});
		//console.log(dbfarr[0])
		if (err) {
			console.log("We have an error:");
			console.log(err);
		}
		return callback(dbfarr)
	});
}

function pokemontypeinfo(msg, info, abilities, stats, callback) {
	var sql = 'SELECT * FROM pokemon_types where pokemon_id = ?';
	connection.query(sql, info.id, function (err, rows, fields) {
		var dbfarr = new Array(rows.length);
		// Loop over the response rows and put the information into an array of maps
		// We can then use this to create our buttons

		rows.forEach(function (item, index) {
			dbfarr[index] = item.type
		});
		//console.log(dbfarr[0])
		if (err) {
			console.log("We have an error:");
			console.log(err);
		}
		return callback(dbfarr)
	});
}

function pokemonabilitiesinfo(msg, info, id, callback) {
	var sql = 'SELECT * FROM pokemon_abilities where pokemon_id = ?';
	connection.query(sql, id, function (err, rows, fields) {
		var dbfarr = new Array(rows.length);
		// Loop over the response rows and put the information into an array of maps
		// We can then use callbackthis to create our buttons

		rows.forEach(function (item, index) {
			dbfarr[index] = item.ability_id
		});
		//console.log(dbfarr)
		if (err) {
			console.log("We have an error:");
			console.log(err); callback
		}
		return callback(dbfarr)
	});
}


/*function geteachability(msg, info, abilityarr, callback){
var abilities = new Array(callbackabilityarr.length)
var itemsProcessed = 0;
abilityarr.forEach((item, index) => {
AsyncFunction(item, index, () => {
abilities[index] = getabilities(item.ability_id);
itemsProcessed++;
if(itemsProcessed === abilityarr.length){return callback(abilities)}
})callback
})
}*/

function geteachability(msg, info, abilityarr, callback) {
	var abilities = new Array(abilityarr.length)
	/*abilityarr.forEach(function(item, index){
	console.log(item.ability_id)
	/*getabilities(item.ability_id, index, function(result){
	//console.log("Hello")
	abilities[index] = result
	//console.log(index)
	//console.log(result)
	//console.log(abilities[index])
	console.log(abilities)
})
abilities[index] = getabilities(item.ability_id);
var i = getabilities(item.ability_id);
console.log(i)
console.log(getabilities(item.ability_id))
})
console.log(abilities)*/
	getabilities(abilities, abilityarr, function (result) {
		return callback(result);
	})
}

function getabilities(abilities, id, callback) {
	var sql = 'SELECT * FROM abilities where';
	if (id.length = 3) {
		var sql = 'SELECT * FROM abilities where id = ? or id = ? or id = ?';
	} else if (id.length = 2) {
		var sql = 'SELECT * FROM abilities where id = ? or id = ?';
	} else if (id.length = 1) {
		var sql = 'SELECT * FROM abilities where id = ?';
	}

	console.log(id)
	//console.log(id)
	connection.query(sql, id, function (err, rows, fields) {
		//console.log(sql)
		var dbfarr = new Array(rows.length);
		// Loop over the response rows and put the information into an array of maps
		// We can then use this to create our buttons


		rows.forEach(function (item, index) {
			dbfarr[index] = item.identifier
		});
		//console.log(dbfarr)
		if (err) {
			console.log("We have an error:");
			console.log(err);
		}
		console.log(dbfarr)
		return callback(dbfarr);
		//return dbfarr[0]
	});
}


function sendpokemon(msg, pokemon, abilities, stats, types, shiny, strong, weak) {
	console.log(pokemon)
	var link = shiny
	if (link == "shiny" && pokemon.name == "deoxys-normal") {
		link = "http://play.pokemonshowdown.com/sprites/xyani-shiny/deoxys.gif"
	} else if (link == "shiny") {
		link = "http://play.pokemonshowdown.com/sprites/xyani-shiny/" + pokemon.name + ".gif"
	} else if (pokemon.name == "deoxys-normal") {
		link = "http://play.pokemonshowdown.com/sprites/xyani/deoxys.gif"
	} else {
		link = "http://play.pokemonshowdown.com/sprites/xyani/" + pokemon.name + ".gif"
	}
	var tempname = pokemon.name
	if (tempname.includes("-")) {
		tempname = pokemon.name.replace("-", " (") + ")"
	}
	var embedmsg = new Discord.RichEmbed()
		.setTitle(tempname.charAt(0).toUpperCase() + tempname.slice(1))
		.setImage(link)
		.addField("Stats:", statsstr(stats), true)
		.addField("Abilities:", abilitiesstr(abilities), true)
		.addField("Types:", abilitiesstr(types), true)
		.addField("Weak Against:", weakagain(weak, types), true)
		.addField("Super Effective:", effectagain(strong, types), true)

	msg.channel.send(embedmsg)
}

function sendmoves(msg, pokemon, moves) {
	console.log(pokemon)
	var movesmsg = abilitiesstr(moves)

	msg.channel.send(movesmsg)
}

function abilitiesstr(arr) {
	var abilities = ''

	arr.forEach(function (item, index) {
		console.log(typeof item);
		tempability = item.replace("-", " ")
		abilities = abilities + tempability.charAt(0).toUpperCase() + tempability.slice(1) + '\n';
	})
	console.log(abilities)
	console.log(arr)
	return abilities;
}

function statsstr(arr) {
	var stats = ''
	arr.forEach(function (item, index) {
		stats = stats + item.identifier.charAt(0).toUpperCase() + item.identifier.slice(1) + ': ' + item.base_stat + "\n";
	})
	console.log(stats)
	console.log(arr)
	return stats;
}

function weakagain(arr, types) {
	var keys = [];
	console.log("types is " + types.length + " long")
	if (types.length == 2 && types[1] != null) {
		_.each(arr, function (val, key) {
			if (val > 200) {
				keys.push(key.charAt(0).toUpperCase() + key.slice(1));
				console.log(key)
			}
		});
	} else {
		_.each(arr, function (val, key) {
			if (val > 100) {
				keys.push(key.charAt(0).toUpperCase() + key.slice(1));
				console.log(key)
			}
		});
	}
	console.log(keys)
	//console.log(arr)
	return keys;
}

function effectagain(arr, types) {
	var keys = [];
	if (types.length == 2 && types[1] != null) {
		_.each(arr, function (val, key) {
			if (val > 200) {
				keys.push(key.charAt(0).toUpperCase() + key.slice(1));
				console.log(key)
			}
		});
	} else {
		_.each(arr, function (val, key) {
			if (val > 100) {
				keys.push(key.charAt(0).toUpperCase() + key.slice(1));
				console.log(key)
			}
		});
	}
	console.log(keys)
	//console.log(arr)
	return keys;
}

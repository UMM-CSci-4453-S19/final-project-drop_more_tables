const Discord = require('discord.js')
mysql = require('mysql')
var _ = require('underscore')
credentials = require('./credentials.json')
const rp = require('request-promise')
port = process.env.PORT || 1337;
var async = require("async");
var emotes = {
	"water" : "<:water:575145110157918229>",
	"steel" : "<:steel:575145110208118786>",
	"rock" : "<:rock:575145110262775840>",
	"psychic" : "<:psychic:575145110208249866>",
	"normal" : "<:normal:575145110174433283>",
	"ice" : "<:ice:575145110342205441>",
	"ground" : "<:ground:575145110350725120>",
	"grass" : "<:grass:575145109885288459>",
	"ghost" : "<:ghost:575145110052929536>",
	"flying" : "<:flying:575145109759459339>",
	"fire" : "<:fire:575145109696282625>",
	"fighting" : "<:fighting:575145109969043466>",
	"fairy" : "<:fairy:575145109654601769>",
	"electric" : "<:electric:575145110006923264>",
	"dragon" : "<:dragon:575145109990015004>",
	"bug" : "<:bug:575145109528772610>",
	"dark" : "<:dark:575152705920827412>",
	"poison" : "<:poison:575152705786478593>"
}

var specialpokemon = {
	"thundurus-incarnate" : "thundurus",
	"landorus-incarnate" : "landorus",
	"meloetta-aria" : "meloetta",
	"keldeo-ordinary" : "keldeo",
	"meowstic-male" : "meowstic",
	"meowstic-female" : "meowstic-f",
	"aegislash-shield" : "aegislash",
	"pumpkaboo-average" : "pumpkaboo",
	"gourgeist-average" : "gourgeist",
	"oricorio-baile" : "oricorio",
	"lycanroc-midday" : "lycanroc",
	"wishiwashi-solo" : "wishiwashi",
	"minior-red-meteor" : "minior-meteor",
	"mimikyu-disguised" : "mimikyu",
	"darmanitan-standard" : "darmanitan",
	"basculin-red-striped" : "basculin",
	"basculin-blue-striped" : "basculin",
	"shaymin-land" : "shaymin",
	"giratina-altered" : "giratina",
	"wormadam-plant" : "wormadam",
	"deoxys-normal" : "deoxys",
	"nidoran-m" : "nidoran",
	"kommo-o" : "kommoo",
	"hakamo-o" : "hakamoo",
	"jangmo-o" : "jangmoo",
	"charizard-mega-x" : "charizard-megax",
	"charizard-mega-y" : "charizard-megay",
	"mewtwo-mega-x" : "mewtwo-megax",
	"mewtwo-mega-y" : "mewtwo-megay",
	"pikachu-rock-star" : "pikachu-rockstar",
	"pikachu-pop-star" : "pikachu-popstar",
	"pikachu-original-cap" : "pikachu-original",
	"pikachu-hoenn-cap" : "pikachu-hoenn",
	"pikachu-sinnoh-cap" : "pikachu-sinnoh",
	"pikachu-unova-cap" : "pikachu-unova",
	"pikachu-kalos-cap" : "pikachu-kalos",
	"pikachu-alola-cap" : "pikachu-alola",
	"pikachu-partner-cap" : "pikachu-partner",
	"greninja-battle-bond" : "greninja-ash",
	"raticate-totem-alola" : "raticate-alola-totem",
	"oricorio-pom-pom" : "oricorio-pompom",
	"minior-orange-meteor" : "minior-meteor",
	"minior-yellow-meteor" : "minior-meteor",
	"minior-green-meteor" : "minior-meteor",
	"minior-blue-meteor" : "minior-meteor",
	"minior-indigo-meteor" : "minior-meteor",
	"minior-violet-meteor" : "minior-meteor",
	"mimikyu-disguised-totem" : "mimikyu-totem",
	"ribombee-totem" : "ribombee",
	"rockruff-own-tempo" : "rockruff",
	"necrozma-dusk" : "necrozma-duskmane",
	"necrozma-dawn" : "necrozma-dawnwings",
	"minior-red" : "minior"
}

var specialabilities = {
	"water-absorb" : "water",
	"volt-absorb" : "electric",
	"lightning-rod" : "electric",
	"levitate" : "ground"
}

var antiinject = []

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
	allPokemon(function(result){
		antiinject = result
	})
})

bot.on('message', function (msg) {
	if (msg.content.startsWith(prefix)) {
		msgcon = msg.content.toLowerCase()
		const args = msgcon.slice(prefix.length).trim().split(/ +/g)

		if (args[0] === "help") {
			var embdmsg = new Discord.RichEmbed()
				.setTitle("Commands")
				.addField("Pokemon", "Get a pokemon specified by it's name, it's associated stats, and a gif of the Pokemon ```!pd pokemon [name]```")
				.addField("Shiny:", "Same as Pokemon, but sends a gif of the shiny version ```!pd shiny [name]```")
				.addField("Moves:", 'Returns a list of the moves that a specified pokemon can learn, by default returns 10 random moves ```!pd moves [name] [number of moves or "all"]```')
			msg.channel.send(embdmsg);
		}
		if (args[0] === "pokemon" && args[1]) {
			var pokemon = args[1];
			if (pokemon == "alolan" || pokemon == "alola" && args[2]) {
				pokemon = args[2] + "-alola"
			} else if (pokemon == "tapu" && args[2]) {
				pokemon = "tapu-" + args[2]
			} else if(args[2]){
				pokemon = args[2] + "-" + args[1]
			}
			pokemoninfo(msg, pokemon, "");
		}

		if (args[0] === "moves" && args[1]) {
			var pokemon = args[1];
			if (pokemon == "alolan" || pokemon == "alola" && args[2]) {
				pokemon = args[2] + "-alola"
			} else if (pokemon == "tapu" && args[2]) {
				pokemon = "tapu-" + args[2]
			} else if(args[3]){
				pokemon = args[2] + "-" + args[1]
			}
			var info = ''
			processpoke = processpokemon(pokemon)
			if (args[2] && args[2] == "all" || args[3] && args[3] == "all") {
				pokemongeninfo(msg, processpoke, function (result) {
					info = result;
					allMoves(msg, info, function (result) {
						sendmoves(msg, info, result);
					});
				});
			} else if (args[2] && isNumeric(args[2]) || args[3] && isNumeric(args[3])) {
				var num = 0;
				if(args[3]){
					num = parseInt(args[3])
				} else {
					num = parseInt(args[2])
				}
				pokemongeninfo(msg, processpoke, function (result) {
					info = result;
					limitedMoves(msg, info, num, function (result) {
						sendmoves(msg, info, result);
					})
				})
			} else {
				pokemongeninfo(msg, processpoke, function (result) {
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
			} else if (pokemon == "tapu" && args[2]) {
				pokemon = "tapu-" + args[2]
			} else if(args[2]){
				pokemon = args[2] + "-" + args[1]
			}
			pokemoninfo(msg, pokemon, "shiny");
		}

		if (args[0] === "custom" && args[10] && args[1] == "create" && !args[2].includes('delimiter') && !args[2].includes(';') && !args[3].includes('delimiter') && !args[3].includes(';') && !args[10].includes('delimiter') && !args[10].includes(';')) {
			var uid = "user_" + msg.member.id.toString();
			var name = args[2]
			var abilities = args[3]
			var health = parseInt(args[4]).toString()
			var attack = parseInt(args[5]).toString()
			var specialattack = parseInt(args[6]).toString()
			var defense = parseInt(args[7]).toString()
			var specialdefense = parseInt(args[8]).toString()
			var speed = parseInt(args[9]).toString()
			var type = args[10]
			if(health && attack && specialattack && defense && specialdefense && speed){
				var sql = "call CustomPokemonInsert(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
				var inputs = [uid, name, abilities, health, attack, specialattack, defense, specialdefense, speed, type]
				sql = mysql.format(sql, inputs);
				console.log(sql)
				connection.query(sql,(function(msg){return function (err, rows, fields) {
					if(err){console.log("We have an insertion error:");
             				console.log(err);
             				msg.channel.send("Failed to add.")
             		} else {
             			msg.channel.send("Successfully added!")
             		}
				}})(msg))
			} else {
				msg.channel.send("Invalid input: stats must contain integers")
			}
		} else if (args[0] === "custom" && args[1] == "create") {
			msg.channel.send("Invalid input")
		}

		if (args[0] === "custom" && args[2] && args[1] == "delete" && !args[2].includes("delimiter") && !args[2].includes(";")) {
			var uid = "user_" + msg.member.id.toString();
			var name = args[2]
			var sql = "Delete from ?? where names = ?"
			var inputs = [uid, name]
			sql = mysql.format(sql, inputs);
			console.log(sql)
			connection.query(sql,(function(msg){return function (err, rows, fields) {
				if(err){console.log("We have an deletion error:");
             			console.log(err);
             			msg.channel.send("Failed to delete.")
             	} else {
             		msg.channel.send("Successfully deleted!")
            		}
			}})(msg))
		} else if (args[0] === "custom" && args[1] == "delete") {
			msg.channel.send("Invalid input")
		}
	}
})

function pokemoninfo(msg, pokemon, shiny) {
	var info = '';
	var abilityinfo = '';
	var abilities = '';
	var stats = '';
	var types = '';
	var eff = '';
	var processpoke = processpokemon(pokemon);
	if (antiinject[processpoke]){
		pokemongeninfo(msg, processpoke, function (result) {
			info = result;
			pokemonabilitiesinfo(msg, info, info.id, function (result) {
				var abilityinfo = result
				geteachability(msg, info, abilityinfo, function (result) {
					abilities = result
					pokemonstatinfo(msg, info, abilities, function (result) {
						stats = result
						pokemontypeinfo(msg, info, abilities, stats, function (result) {
							types = result
							effagain(msg, info, abilities, stats, types, shiny, function (result) {
								eff = result
								resagain(msg, info, abilities, stats, types, shiny, eff, function (result) {
									sendpokemon(msg, info, abilities, stats, types, shiny, eff, result);
							})
						})
					})
				})
			})
		})
	})}
}

function processpokemon(pokemon){
	var processpoke = ''
	if (pokemon == "thundurus" || pokemon == "landorus" || pokemon == "tornadus"){
		processpoke = pokemon + "-incarnate" 
	} else if (pokemon == "meloetta") {
		processpoke = pokemon + "-aria" 
	} else if (pokemon == "keldeo") {
		processpoke = pokemon + "-ordinary" 
	} else if (pokemon == "meowstic") {
		processpoke = pokemon + "-male" 
	} else if (pokemon == "aegislash") {
		processpoke = pokemon + "-shield"
	} else if (pokemon == "pumpkaboo" || pokemon == "gourgeist") {
		processpoke = pokemon + "-average"
	} else if (pokemon == "oricorio") {
		processpoke = pokemon + "-baile"
	} else if (pokemon == "lycanroc") {
		processpoke = pokemon + "-midday"
	} else if (pokemon == "wishiwashi") {
		processpoke = pokemon + "-solo"
	} else if (pokemon == "minior") {
		processpoke = pokemon + "-red-meteor"
	} else if (pokemon == "mimikyu") {
		processpoke = pokemon + "-disguised"
	} else if (pokemon == "darmanitan") {
		processpoke = pokemon + "-standard"
	} else if (pokemon == "basculin") {
		processpoke = pokemon + "-red-striped"
	} else if (pokemon == "shaymin") {
		processpoke = pokemon + "-land"
	} else if (pokemon == "giratina") {
		processpoke = pokemon + "-altered"
	} else if (pokemon == "wormadam") {
		processpoke = pokemon + "-plant"
	} else if (pokemon == "nidoran") {
		processpoke = pokemon + "-m"
	} else {
		processpoke = pokemon
	}
	return processpoke
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

		rows.forEach(function (item, index) {
			var target = item.target_type
			dbfarr[target] = dbfarr[target] + item.damage_factor
		});
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
	}
	connection.query(sql, types, function (err, rows, fields) {
		var dbfarr = {
			"normal": 1,
			"fighting": 1,
			"flying": 1,
			"poison": 1,
			"ground": 1,
			"rock": 1,
			"bug": 1,
			"ghost": 1,
			"steel": 1,
			"fire": 1,
			"water": 1,
			"grass": 1,
			"electric": 1,
			"psychic": 1,
			"ice": 1,
			"dragon": 1,
			"dark": 1,
			"fairy": 1
		}

		rows.forEach(function (item, index) {
			var target = item.damage_type
			if(dbfarr[target] != 0){
				dbfarr[target] = dbfarr[target] * item.damage_factor
			}
		});
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

		rows.forEach(function (item, index) {
			dbfarr[index] = item.identifier;
		});
		if (err) {
			console.log("We have an error:");
			console.log(sql);
			console.log(err);
		}
		return callback(dbfarr)
	});
}

function allPokemon(callback) {
	var sql = 'SELECT id, stat_identifier from pokemon';
	connection.query(sql, function (err, rows, fields) {
		var dbfarr = new Array(rows.length);

		rows.forEach(function (item, index) {
			dbfarr[item.stat_identifier] = item.id;
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
			dbfarr[index] = item.identifier
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
	var pokemoninfo = {"name": pokemon,
					   "id": antiinject[pokemon]}
	return callback(pokemoninfo)
}

function pokemonstatinfo(msg, info, abilities, callback) {
	var sql = 'SELECT * FROM pokemon_stats where pokemon_id = ?';
	connection.query(sql, info.id, function (err, rows, fields) {
		var dbfarr = new Array(rows.length);

		rows.forEach(function (item, index) {
			dbfarr[index] = {
				"base_stat": item.base_stat,
				"identifier": item.identifier
			};
		});
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

		rows.forEach(function (item, index) {
			dbfarr[index] = item.type
		});
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

		rows.forEach(function (item, index) {
			dbfarr[index] = item.ability_id
		});
		if (err) {
			console.log("We have an error:");
			console.log(err); callback
		}
		return callback(dbfarr)
	});
}

function geteachability(msg, info, abilityarr, callback) {
	var abilities = new Array(abilityarr.length)
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
	connection.query(sql, id, function (err, rows, fields) {
		var dbfarr = new Array(rows.length);

		rows.forEach(function (item, index) {
			dbfarr[index] = item.identifier
		});
		if (err) {
			console.log("We have an error:");
			console.log(err);
		}
		return callback(dbfarr);
	});
}


function sendpokemon(msg, pokemon, abilities, stats, types, shiny, strong, weak) {
	var link = shiny
	var tempname = ''
	if(specialpokemon[pokemon.name]){
		tempname = specialpokemon[pokemon.name]
	} else {
		tempname = pokemon.name
	}
	if (link == "shiny") {
		link = "http://play.pokemonshowdown.com/sprites/xyani-shiny/" + tempname + ".gif"
	}  else {
		link = "http://play.pokemonshowdown.com/sprites/xyani/" + tempname + ".gif"
	}
	var newname = ''
	if (pokemon.name == "porygon-z" || pokemon.name.includes("tapu") || pokemon.name.endsWith("-o")) {
		newname = pokemon.name
	} else if (tempname.includes("-")) {
		newname = tempname.replace("-", " (") + ")"
	} else {
		newname = tempname
	}
	var embedmsg = new Discord.RichEmbed()
	.setTitle(newname.charAt(0).toUpperCase() + newname.slice(1))
	.setImage(link)
	.addField("Stats:", statsstr(stats), true)
	.addField("Abilities:", abilitiesstr(abilities), true)
	.addField("Types:", typesstr(types), true)
	.addField("Weak Against:", weakorstrprocess(weakagain(weak, types, tempname, abilities)), true)
	.addField("Resistant Against:", weakorstrprocess(resagainst(weak, types, tempname, abilities)), true)
	var immune = immuneagain(weak, types, abilities)
	if(immune.length > 0){
		embedmsg = embedmsg.addField("Immune Against:", weakorstrprocess(immune), true)
	}
	embedmsg = embedmsg.addField("Super Effective Against:", typesstr(effectagain(strong, types)), true)

	msg.channel.send(embedmsg)
}

function sendmoves(msg, pokemon, moves) {
	var movesmsg = abilitiesstr(moves)

	msg.channel.send(movesmsg)
}

function abilitiesstr(arr) {
	var abilities = ''

	arr.forEach(function (item, index) {
		var tempability = item.replace("-", " ")
		abilities = abilities + tempability.charAt(0).toUpperCase() + tempability.slice(1) + '\n';
	})
	return abilities;
}

function typesstr(arr) {
	var type = ''
	if(arr.length > 0){
		arr.forEach(function (item, index) {
			type = type + emotes[item] + " " + item.charAt(0).toUpperCase() + item.slice(1) + "\n";
		})
	} else {
		type = 'No Effectiveness'
	}
	return type;
}

function statsstr(arr) {
	var stats = ''
	arr.forEach(function (item, index) {
		stats = stats + item.identifier.charAt(0).toUpperCase() + item.identifier.slice(1) + ': ' + item.base_stat + "\n";
	})
	return stats;
}

function weakorstrprocess(arr){
	var type = ''
	if(arr.length > 0){
		arr.forEach(function (item, index) {
			type = type + emotes[item.type] + " " + item.type.charAt(0).toUpperCase() + item.type.slice(1) + " (" + item.effect + ")" + "\n";
		})
	} else {
		type = 'No Resistances'
	}
	return type
}

function weakagain(arr, types, pokemon) {
	var keys = [];
	if (pokemon.includes("necrozma") && !pokemon.includes("ultra") && types.length == 2 && types[1] != null){
		_.each(arr, function (val, key) {
			if (val == 40000) {
				keys.push({"type" : key,
						   "effect" : "x3"});
			} else if (val > 15000) {
				keys.push({"type" : key,
						   "effect" : "x1.5"});
			}
		});
	} else if (pokemon.includes("necrozma") && !pokemon.includes("ultra")) {
		_.each(arr, function (val, key) {
			if (val > 100) {
				keys.push({"type" : key,
						   "effect" : "x1.5"});
			}
		});
	} else if (types.length == 2 && types[1] != null) {
		_.each(arr, function (val, key) {
			if (val == 40000) {
				keys.push({"type" : key,
						   "effect" : "x4"});
			} else if (val > 15000) {
				keys.push({"type" : key,
						   "effect" : "x2"});
			}
		});
	} else {
		_.each(arr, function (val, key) {
			if (val > 100) {
				keys.push({"type" : key,
						   "effect" : "x2"});
			}
		});
	}
	return keys;
}

function immuneagain(arr, types, abilities) {
	var keys = [];
	var waterabsorb = abilities.includes("water-absorb") && abilities.length == 1
	var wonderguard = abilities.includes("wonder-guard") && abilities.length == 1
	var voltabsorb = abilities.includes("volt-absorb") && abilities.length == 1
	var lightningrod = abilities.includes("lightning-rod") && abilities.length == 1
	var levitate = abilities.includes("levitate") && abilities.length == 1
	if (waterabsorb){
		keys.push({"type" : "water",
				   "effect" : "x0"})
	}
	if (voltabsorb || lightningrod){
		keys.push({"type" : "electric",
				   "effect" : "x0"})
	}
	if (levitate){
		keys.push({"type" : "ground",
				   "effect" : "x0"})
	}
	if (wonderguard){
		keys.push({"type" : "normal",
				   "effect" : "x0"})
		keys.push({"type" : "fighting",
				   "effect" : "x0"})
		keys.push({"type" : "poison",
				   "effect" : "x0"})
		keys.push({"type" : "ground",
				   "effect" : "x0"})
		keys.push({"type" : "bug",
				   "effect" : "x0"})
		keys.push({"type" : "steel",
				   "effect" : "x0"})
		keys.push({"type" : "water",
				   "effect" : "x0"})
		keys.push({"type" : "grass",
				   "effect" : "x0"})
		keys.push({"type" : "electric",
				   "effect" : "x0"})
		keys.push({"type" : "psychic",
				   "effect" : "x0"})
		keys.push({"type" : "ice",
				   "effect" : "x0"})
		keys.push({"type" : "dragon",
				   "effect" : "x0"})
		keys.push({"type" : "fairy",
				   "effect" : "x0"})
	} 
	if (types.length == 2 && types[1] != null) {
		_.each(arr, function (val, key) {
			if (val == 0) {
				keys.push({"type" : key,
						   "effect" : "x0"});
			}
		});
	} else {
		_.each(arr, function (val, key) {
			if (val == 0) {
				keys.push({"type" : key,
						   "effect" : "x0"});
			}
		});
	}
	return keys;
}

function resagainst(arr, types, pokemon, abilities) {
	var keys = [];
	var inability = specialabilities[abilities[0]]
	var hasability = inability && abilities.length == 1
	if (pokemon != "shedinja") {
		if (types.length == 2 && types[1] != null) {
			_.each(arr, function (val, key) {
				if (val == 2500 && !hasability) {
					keys.push({"type" : key,
							   "effect" : "x1/4"});
				} else if (val == 5000 && !hasability) {
					keys.push({"type" : key,
							   "effect" : "x1/2"});
				} else if (val == 2500 && hasability && inability != key) {
					keys.push({"type" : key,
							   "effect" : "x1/4"});
				} else if (val == 5000 && hasability && inability != key) {
					keys.push({"type" : key,
							   "effect" : "x1/2"});
				}
			});
		} else {
			_.each(arr, function (val, key) {
				if (val < 100 && val > 0 && !hasability) {
					keys.push({"type" : key,
							   "effect" : "x1/2"});
				} else if (val < 100 && val > 0 && hasability && inability != key) {
					keys.push({"type" : key,
							   "effect" : "x1/2"});
				}
			});
		}}
	return keys;
}

function effectagain(arr, types) {
	var keys = [];
	if (types.length == 2 && types[1] != null) {
		_.each(arr, function (val, key) {
			if (val > 200) {
				keys.push(key);
			}
		});
	} else {
		_.each(arr, function (val, key) {
			if (val > 100) {
				keys.push(key);
			}
		});
	}
	return keys;
}

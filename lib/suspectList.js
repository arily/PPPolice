function suspectList(hashname = 'PPPolice'){
	const hname = hashname;
	const redis = require("async-redis");
	const client = redis.createClient({host:'219.117.244.203'});
	client.on("error", function (err) {
    	console.log("Error " + err);
	});

	const osu = require('node-osu');
	function rebindProto(account){
		account.__proto__ = osu.User.prototype;
		account.events.forEach(e => {
			e.__proto__ = osu.Event.prototype;
		});
		account.bp.forEach(e => {
			e.__proto__ = osu.Score.prototype;
		});
		return account;
	}
	async function isset(account){
		return await client.hexists(hname, account.id);
	}
	async function get(account){
		ret = JSON.parse(await client.hget(hname, account.id));
		return rebindProto(ret);
	}
	async function get_(account){
		ret = JSON.parse(await client.hget(hname, account.id));
		return ret;
	}
	async function set(account){
		return await client.hset(hname, account.id, JSON.stringify(account));
	}
	async function keys(){
		return client.hkeys(hname);
	}
	async function getAll(){
		all = await client.hgetall(hname);
		// Object.keys(all).map( item => {
		// 	all[item] = rebindProto(JSON.parse(all[item]))
		// });
		for (let key in all){
			all[key] = rebindProto(JSON.parse(all[key]));
		}
		return all;
	}
	return {
		isset: isset,
		get: get,
		get_: get_,
		getAll: getAll,
		set: set,
		keys: keys
	}
}

module.exports = suspectList;
async function final() {
    let players = `cplayer
Heeeeeea
Crystal
heisiban
arily
B C
Fear Kubrick
newplayre
Sin_smile
Hydronerious
Yukino Miko
My angel ashu
TROU2004
Dragons
Yuans
Miracle
Mariko Sakuragi
Chippu
Kuuki ToRa
Shamiko sama
Yuiko122
fatballgaygaygg
Tory Cell
Moe`.split("\n");

    const osu = require("node-osu");

    let api = new osu.Api('27caa4993a4430b2e63762bdd5e6b9643ddf7679');

    let result = await Promise.all(players.map(async p => {
        return await api.getUser({ u: p });
    }));

    console.log(JSON.stringify(result));
}


final();
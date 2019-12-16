function Score() {

}
Score.prototype.isDeranking = function() {
    return (this.withNF() || this.withSO()) && ['XS', 'XH', 'SH', 'S', 'A'].includes(this.rank);
}
Score.prototype.withNF = function() {
    return this._mods.includes("NoFail")
}
Score.prototype.withSO = function() {
    return this._mods.includes("SpunOut")
}
Score.prototype.shortMods = function() {
    const shortMods = {
        Easy: "EZ",
        NoFail: "NF",
        HalfTime: "HT",
        HardRock: "HR",
        SuddenDeath: "SD",
        DoubleTime: "DT",
        Nightcore: "NC",
        Hidden: "HD",
        Flashlight: "FL",
        SpawnOut: "SO",
    }
    let mods = this._mods.filter(s => s !== 'FreeModAllowed');
    //remove DT when NC is set
    if (mods.some(s => s === 'Nightcore')) {
        mods = mods.filter(s => s !== 'DoubleTime');
    }
    mods = mods.map(mod => shortMods[mod]);
    return mods;
}


export default Score;
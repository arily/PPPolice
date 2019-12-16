function Result() {

}


Result.prototype.isDeranking = function() {
    return (this.withNF() || this.withSO()) && ['XS', 'XH', 'SH', 'S', 'A'].includes(this.newScore.rank);
}
Result.prototype.withNF = function() {
    return this.mods.includes("NoFail")
}
Result.prototype.withSO = function() {
    return this.mods.includes("SpunOut")
}

export default Result;
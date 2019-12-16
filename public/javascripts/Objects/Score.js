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
export default Score;
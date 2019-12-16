import sortFunc from "./ppDesc.js";
export default (pushed) => {
    pushed.map((score) => {
        score.result.beatmap.madeBy = function(mapper) {
            return this.creator == mapper || this.version.includes(mapper) || this.version.includes(mapper.toLowerCase())
        }
        score.result.beatmap.is = function(mapper) {
            return this.source.toLowerCase().includes(mapper.toLowerCase()) || this.title.toLowerCase().includes(mapper.toLowerCase())
        }
        score.result.beatmap.byShitMapper = function() {
            return (
                this.madeBy("Sotarks") ||
                this.madeBy("Awaken") ||
                this.madeBy("Fiery") || this.madeBy("fieryrage") ||
                this.madeBy("Natsu") ||
                this.madeBy("VINXIS") ||
                this.madeBy("Fatfan Kolek") ||
                this.madeBy("Log Off Now") ||
                this.madeBy("A r M i N") ||
                this.madeBy("Reform") ||
                this.madeBy("Taeyang") ||
                this.madeBy("Lami") ||
                this.madeBy("Monstrata") ||
                this.madeBy("Kyuukai") ||
                this.madeBy("-Keitaro") ||
                this.madeBy('Nevo')
            )
        }
        score.result.beatmap.isShitMap = function() {
            return (
                this.is("chika chika") ||
                this.is("oneroom") ||
                this.is("harumachi clover") ||
                this.is("natsuzora yell") ||
                this.is("koi no hime hime") ||
                this.is("best friends") ||
                this.is("Kani*Do-Luck!") ||
                this.is("yuki no hana") ||
                this.is("kira kira days") ||
                this.is("kimi no bouken")
            )
        }
        score.result.isDeranking = function() {
            return (this.withNF() || this.withSO()) && ['XS', 'XH', 'SH', 'S', 'A'].includes(this.newScore.rank);
        }
        score.result.withNF = function() {
            return this.mods.includes("NoFail")
        }
        score.result.withSO = function() {
            return this.mods.includes("SpunOut")
        }

        if (score.result.isDeranking()) {
            console.log(score.result);
            score.result.pp = score.result.withSO() ? (score.result.pp / 0.9) : score.result.pp;
            score.result.pp = score.result.withNF() ? (score.result.pp / 0.9) : score.result.pp;
        } else if ((score.result.beatmap.byShitMapper() || score.result.beatmap.isShitMap())) {
            score.result.pp = 0;
        }

        return score;
    });
    sortFunc(pushed);
};
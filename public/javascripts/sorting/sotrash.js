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
            return this.mods.some(mod => (mod == 'NoFail' || mod == "SpunOut"));
        }
        score.result.pp = ((score.result.beatmap.byShitMapper() || score.result.beatmap.isShitMap() || !score.result.isDeranking()) ? 0 : score.result.pp)
        return score;
    });
    sortFunc(pushed);
};
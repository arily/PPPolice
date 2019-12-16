import sortFunc from "./ppDesc.js";
export default (pushed) => {
    console.log(pushed[0]);
    pushed.map((score) => {
        score.result.beatmap.madeBy = function(mapper) {
            return this.creator == mapper || this.version.includes(mapper) || this.version.includes(mapper.toLowerCase())
        }
        score.result.beatmap.byShitMapper = function() {
            return (
                this.madeBy("Sotarks") ||
                this.madeBy("Fiery") || this.madeBy("fieryrage") ||
                this.madeBy("Natsu") ||
                this.madeBy("A r M i N") ||
                this.madeBy("Reform") ||
                this.madeBy("Taeyang") ||
                this.madeBy("Lami") ||
                this.madeBy("Monstrata") ||
                this.madeBy("Kyuukai") ||
                this.madeBy('Nevo')
            )
        }
        score.result.pp = (score.result.beatmap.byShitMapper() ? 0 : score.result.pp)
        return score;
    });
    sortFunc(pushed);
};
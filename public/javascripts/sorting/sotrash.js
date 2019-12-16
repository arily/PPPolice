import sortFunc from "./ppDesc.js";
import Result from "../Objects/Result.js";
import Score from "../Objects/Score.js";
import User from "../Objects/User.js";
import Beatmap from "../Objects/Beatmap.js";
export default async (pushed) => {
    pushed.map((score) => {
        // score.result.__proto__ = Result.prototype;
        score.result.newScore.__proto__ = Score.prototype;
        score.result.beatmap.__proto__ = Beatmap.prototype;
        if (score.result.newScore.isDeranking()) {
            score.result.pp = score.result.newScore.withSO() ? (score.result.pp / 0.9) : score.result.pp;
            score.result.pp = score.result.newScore.withNF() ? (score.result.pp / 0.9) : score.result.pp;
        } else if ((score.result.beatmap.byShitMapper() || score.result.beatmap.isShitMap())) {
            score.result.pp = 0;
        }

        return score;
    });
    sortFunc(pushed);
};
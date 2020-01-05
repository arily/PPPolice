export default async (pushed) => {
    pushed.map((score) => {
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
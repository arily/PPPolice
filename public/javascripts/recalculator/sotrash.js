export default async (pushed) => {
    pushed.map((score) => {
        if (score.result.newScore.isDeranking()) {
            score.result.oldScore = {};
            Object.assign(score.result.oldScore, score.result.newScore);
            score.type = 'refarm';

            score.result.pp = score.result.newScore.withSO() ? (score.result.pp / 0.9) : score.result.pp;
            score.result.pp = score.result.newScore.withNF() ? (score.result.pp / 0.9) : score.result.pp;
            score.result.roundPP();
        } else if ((score.result.beatmap.byShitMapper() || score.result.beatmap.isShitMap())) {
        	score.result.oldScore = {};
            Object.assign(score.result.oldScore, score.result.newScore);

            score.type = 'defarm';

            score.result.pp = 0;
        }
        return score;
    });

};
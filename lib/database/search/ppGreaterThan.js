module.exports = (pp, fields) => [{
        $project: Object.assign(fields, {
            bp: {
                $filter: {
                    input: "$bp",
                    as: "record",
                    cond: { $gt: ["$$record.pp", pp] }
                }
            },
        })
    },
    {
        $match: {
            'bp.0': { $exists: true }
        }
    }
];
module.exports = (date, fields) => [{
    $project: Object.assign(fields, {
        bp: {
            $filter: {
                input: "$bp",
                as: "record",
                cond: {
                    $gt: [{
                        $dateFromString: {
                            dateString: "$$record.raw_date",
                            //format: "%G-%m-%d %H-%M-%S"
                        }
                    }, {
                        $dateFromString: {
                            dateString: date,
                            //format: "%G-%m-%d %H-%M-%S"
                        }
                    }]
                }
            }
        },
    })
}, {
    $match: {
        'bp.0': { $exists: true }
    }
}]
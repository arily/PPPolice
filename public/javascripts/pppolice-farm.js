async function showFarm(bps, from, buff = -8, farmLimit = 10) {

    bps = await calcAllAccountsFarm(...arguments);
    let dataSet = [];
    await Promise.all(Object.keys(bps).map(async user => {
        user = bps[user];
        //uid,uname,pp,farm,pptoday,farm3,bp3,farm5,bp5
        if (user.pptoday > 0) dataSet[dataSet.length] = [
            user.id,
            user.name,
            user.pp,
            user.farmtoday,
            user.pptoday,
            user.farm3,
            user.bp3,
            user.farm5,
            user.bp5
        ];
    }));
    $('#table').DataTable({
        data: dataSet,
        columns: [
            { title: "UserID" },
            { title: "UserName" },
            { title: "pp" },
            { title: "FARM" },
            { title: "PP today" },
            { title: "farm3" },
            { title: "bp3" },
            { title: "farm5" },
            { title: "bp5" },
        ],
        columnDefs: [{
            targets: [2, 4, 6, 8],
            render: (data, type, row, ) => {
                if (type === 'display') {
                    return data.toFixed( 2 );
                } else {
                    return data;
                }
            }
        }, {

            targets: [3, 5, 7],
            render: (data, type, row, ) => {
                if (type === 'display') {
                    return data.toFixed( 4 );
                } else {
                    return data;
                }
            }
        }, {
            className: "monospace",
            targets: [2,3,4,5,6,7,8]
        }, {
            className: "dt-body-right monospace",
            targets: [0,1]
        }, ],

    });
}
async function calcAllAccountsFarm(bps, from, buff = -8, farmLimit = 10) {

    await Promise.all(Object.keys(bps).map(async user => {
        user = bps[user];

        let cabbageResult = await cabbageGetAccount(user, from);
        if (cabbageResult.code === 0) {
            let cabbageUser = cabbageResult.data[0];

            user.pp = cabbageUser.ppRaw;
            user.rank = cabbageUser.ppRank;
            user.pptoday = calculateBP(user, 100);
            user.bp3 = calculateBP(user, 3);
            user.bp5 = calculateBP(user, 5);
            user.farmtoday = calcFarm(user, 10 + buff, 10 - buff, farmLimit);
            user.farm3 = calcFarm(user, 10 + buff, 10 - buff, 3);
            user.farm5 = calcFarm(user, 10 + buff, 10 - buff, 5);

        } else {
            console.log(`can't read user info from cabbage, when reading user ${user.name}`);
            console.log(cabbageResult);
        }
    }));
    return bps;
}
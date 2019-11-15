async function showFarm(bps, from, buff = -8, farmLimit = 10) {

    bps = await calcAllAccountsFarm(...arguments);
    let myStorage = localStorage;
    myStorage.setItem('FARM-List', JSON.stringify(bps));
    dataSet = await createDataSet(bps);
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
                    return parseFloat(data).toFixed(2);
                } else {
                    return data;
                }
            }
        }, {

            targets: [3, 5, 7],
            render: (data, type, row, ) => {
                if (type === 'display') {
                    return parseFloat(data).toFixed(4);
                } else {
                    return data;
                }
            }
        }, {
            className: "monospace",
            targets: [1]
        }, {
            className: "monospace",
            targets: [0],
            render: (data, type, row, ) => {
                if (type === 'display') {
                    return `<a rel="noopener noreferrer" target="_blank" href="https://osu.ppy.sh/users/${data}">${data}</a>`;
                } else {
                    return data;
                }
            },
        }, {
            className: "dt-body-right monospace",
            targets: [2, 3, 4, 5, 6, 7, 8]
        }, ],

    });
}
async function createDataSet(bps) {
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
    return dataSet;
}
//初始化会议详情数据
function initDetailTableData(dataArr) { //dataArr是表格数据数组，和初始化配置需一样的结构
    var table = $('#table').DataTable();
    table.clear();
    table.rows.add(dataArr); // Add new data
    table.columns.adjust().draw(false); // Redraw the DataTable
}
async function calcAllAccountsFarm(bps, from, buff = -8, farmLimit = 10) {


    await Promise.all(Object.keys(bps).map(async user => {
        user = bps[user];

        let cabbageResult = await cabbageGetAccount(user, from);
        if (cabbageResult.code === 0) {
            let cabbageUser = cabbageResult.data[0];

            user.pp = cabbageUser.ppRaw;
            user.rank = cabbageUser.ppRank;
            user.pptoday = calculateBP(user, farmLimit);
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

async function recalculateAllAccountsFarm(bps, buff = -8, farmLimit = 10) {
    let highbuff = 10 + buff;
    let lowbuff = 10 - buff;
    await Promise.all(Object.keys(bps).map(async user => {
        user = bps[user];
        user.farmtoday = calcFarm(user, highbuff, lowbuff, farmLimit);
        user.farm3 = calcFarm(user, highbuff, lowbuff, 3);
        user.farm5 = calcFarm(user, highbuff, lowbuff, 5);
    }));
}

async function onFarmBuffChange(buff = -8, farmLimit = 10) {
    buff = parseFloat(buff);

    let bps = JSON.parse(localStorage.getItem('FARM-List'));
    recalculateAllAccountsFarm(bps, buff);
    dataSet = await createDataSet(bps);
    initDetailTableData(dataSet);
}
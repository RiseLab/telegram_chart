function lCtrlMove (e) {
    let pageXChange = pageX - e.pageX;
    if ((naviWinWidth + pageXChange >= 100) && (naviLmaskWidth - pageXChange >= 0)) {
        naviWin.style.width = naviWinWidth + pageXChange + 'px';
        naviLmask.style.width = naviLmaskWidth - pageXChange + 'px';

        drawCanvas(ctx, mainCanvas, gDataAll[0], [
            Math.floor((naviLmaskWidth - pageXChange) / controlCanvasObj.xMult),
            Math.floor(naviRmaskWidth / controlCanvasObj.xMult)
        ], true);
    }
}
function rCtrlMove (e) {
    let pageXChange = pageX - e.pageX;
    if ((naviWinWidth - pageXChange >= 100) && (naviRmaskWidth + pageXChange >= 0)) {
        naviWin.style.width = naviWinWidth - pageXChange + 'px';
        naviRmask.style.width = naviRmaskWidth + pageXChange + 'px';

        drawCanvas(ctx, mainCanvas, gDataAll[0], [
            Math.floor(naviLmaskWidth / controlCanvasObj.xMult),
            Math.floor((naviRmaskWidth + pageXChange) / controlCanvasObj.xMult)
        ], true);
    }
}
function winMove (e) {
    let pageXChange = pageX - e.pageX;
    if ((naviLmaskWidth - pageXChange >= 0) && (naviRmaskWidth + pageXChange >= 0)) {
        naviLmask.style.width = (naviLmaskWidth - pageXChange) + 'px';
        naviRmask.style.width = (naviRmaskWidth + pageXChange) + 'px';

        drawCanvas(ctx, mainCanvas, gDataAll[0], [
            Math.floor((naviLmaskWidth - pageXChange) / controlCanvasObj.xMult),
            Math.floor((naviRmaskWidth + pageXChange) / controlCanvasObj.xMult)
        ], true);
    }
}
function ctrlStop (e) {
    window.removeEventListener('mousemove', lCtrlMove);
    window.removeEventListener('mousemove', rCtrlMove);
    window.removeEventListener('mousemove', winMove);
    naviWinWidth = naviWin.clientWidth;
    naviLmaskWidth = naviLmask.clientWidth;
    naviRmaskWidth = naviRmask.clientWidth;
    pageX = 0;
}

function convertY (y, yStart) {
    return yStart - y;
}

function drawCanvas (context, settings, data, dataTrim = [0, 0], grid = false) {
    let ctx = context,
        gData = data,
        gDates = [],
        gLines = [],
        yMax = 0;

    gData.columns.forEach(function (colItem) {
        let colName = colItem[0],
            colType = gData.types[colName],
            colItemCp = colItem.slice(dataTrim[0] || 1, dataTrim[1] ? -dataTrim[1] : colItem.length);
        if (colType === 'x') {
            gDates = colItemCp;
        } else if (colType === 'line') {
            gLines.push({
                name: gData['names'][colName],
                color: gData['colors'][colName],
                data: colItemCp
            });
            yMax = Math.max(yMax, Math.max(...colItemCp));
        }
    });

    let segmentsCount = gDates.length - 1,
        xMult = settings.width / segmentsCount,
        yMult = settings.height / yMax;

    if (grid) {
        ctx.clearRect(0, 0, settings.width, settings.height + 40);
        drawGrid(ctx, settings, gDates, [xMult, yMult]);
    }

    gLines.forEach(function (gLine) {
        ctx.beginPath();
        ctx.moveTo(settings.start.x, convertY(gLine.data[0] * yMult, settings.start.y));
        for (i = 1; i <= segmentsCount; i++) {
            ctx.lineTo(i * xMult, convertY(gLine.data[i] * yMult, settings.start.y));
        }
        ctx.lineWidth = settings.lineWidth;
        ctx.strokeStyle = gLine.color;
        ctx.stroke();
    });

    return {
        dates: gDates,
        lines: gLines,
        xMult: xMult
    };
}

function drawGrid (ctx, settings, dates, mults = [1, 1]) {
    let hLinesCount = 5,
        vLinesCount = 6,
        hLineMult = Math.floor(settings.height / (hLinesCount * mults[1])),
        vLineMult = Math.floor(settings.width / (vLinesCount * mults[0]));
    ctx.beginPath();
    for (i = 0; i <= hLineMult * hLinesCount; i += hLineMult) {
        ctx.moveTo(settings.start.x, convertY(i * mults[1], settings.start.y));
        ctx.lineTo(settings.width, convertY(i * mults[1], settings.start.y));
        ctx.fillText(i, 5, convertY(i * mults[1] + 10, settings.start.y));
    }
    for (i = 0; i <= vLinesCount; i++) {
        let lineDate = new Date(dates[i * vLineMult]),
            lineStr = lineDate.toLocaleString('en-us', { month: 'short', day: '2-digit' }).toLowerCase();
        // ctx.moveTo(i * vLineMult * mults[0], settings.start.y);
        // ctx.lineTo(i * vLineMult * mults[0], 0);
        ctx.fillText(lineStr, i * vLineMult * mults[0] - 15, settings.start.y + 15);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#d3d3d3';
    ctx.stroke();
}

let canvas = document.getElementById('graph'),
    naviLmask = document.getElementsByClassName('graph-navi__lmask')[0],
    naviRmask = document.getElementsByClassName('graph-navi__rmask')[0],
    naviLctrl = document.getElementsByClassName('graph-navi__lctrl')[0],
    naviRctrl = document.getElementsByClassName('graph-navi__rctrl')[0],
    naviWin = document.getElementsByClassName('graph-navi__win')[0],
    naviWinWidth = naviWin.clientWidth,
    naviLmaskWidth = naviLmask.clientWidth,
    naviRmaskWidth = naviRmask.clientWidth,
    pageX = 0,
    gDataAll = [
        {
            "columns": [
                [
                    "x",
                    1542412800000,
                    1542499200000,
                    1542585600000,
                    1542672000000,
                    1542758400000,
                    1542844800000,
                    1542931200000,
                    1543017600000,
                    1543104000000,
                    1543190400000,
                    1543276800000,
                    1543363200000,
                    1543449600000,
                    1543536000000,
                    1543622400000,
                    1543708800000,
                    1543795200000,
                    1543881600000,
                    1543968000000,
                    1544054400000,
                    1544140800000,
                    1544227200000,
                    1544313600000,
                    1544400000000,
                    1544486400000,
                    1544572800000,
                    1544659200000,
                    1544745600000,
                    1544832000000,
                    1544918400000,
                    1545004800000,
                    1545091200000,
                    1545177600000,
                    1545264000000,
                    1545350400000,
                    1545436800000,
                    1545523200000,
                    1545609600000,
                    1545696000000,
                    1545782400000,
                    1545868800000,
                    1545955200000,
                    1546041600000,
                    1546128000000,
                    1546214400000,
                    1546300800000,
                    1546387200000,
                    1546473600000,
                    1546560000000,
                    1546646400000,
                    1546732800000,
                    1546819200000,
                    1546905600000,
                    1546992000000,
                    1547078400000,
                    1547164800000,
                    1547251200000,
                    1547337600000,
                    1547424000000,
                    1547510400000,
                    1547596800000,
                    1547683200000,
                    1547769600000,
                    1547856000000,
                    1547942400000,
                    1548028800000,
                    1548115200000,
                    1548201600000,
                    1548288000000,
                    1548374400000,
                    1548460800000,
                    1548547200000,
                    1548633600000,
                    1548720000000,
                    1548806400000,
                    1548892800000,
                    1548979200000,
                    1549065600000,
                    1549152000000,
                    1549238400000,
                    1549324800000,
                    1549411200000,
                    1549497600000,
                    1549584000000,
                    1549670400000,
                    1549756800000,
                    1549843200000,
                    1549929600000,
                    1550016000000,
                    1550102400000,
                    1550188800000,
                    1550275200000,
                    1550361600000,
                    1550448000000,
                    1550534400000,
                    1550620800000,
                    1550707200000,
                    1550793600000,
                    1550880000000,
                    1550966400000,
                    1551052800000,
                    1551139200000,
                    1551225600000,
                    1551312000000,
                    1551398400000,
                    1551484800000,
                    1551571200000,
                    1551657600000,
                    1551744000000,
                    1551830400000,
                    1551916800000,
                    1552003200000
                ],
                [
                    "y0",
                    37,
                    20,
                    32,
                    39,
                    32,
                    35,
                    19,
                    65,
                    36,
                    62,
                    113,
                    69,
                    120,
                    60,
                    51,
                    49,
                    71,
                    122,
                    149,
                    69,
                    57,
                    21,
                    33,
                    55,
                    92,
                    62,
                    47,
                    50,
                    56,
                    116,
                    63,
                    60,
                    55,
                    65,
                    76,
                    33,
                    45,
                    64,
                    54,
                    81,
                    180,
                    123,
                    106,
                    37,
                    60,
                    70,
                    46,
                    68,
                    46,
                    51,
                    33,
                    57,
                    75,
                    70,
                    95,
                    70,
                    50,
                    68,
                    63,
                    66,
                    53,
                    38,
                    52,
                    109,
                    121,
                    53,
                    36,
                    71,
                    96,
                    55,
                    58,
                    29,
                    31,
                    55,
                    52,
                    44,
                    126,
                    191,
                    73,
                    87,
                    255,
                    278,
                    219,
                    170,
                    129,
                    125,
                    126,
                    84,
                    65,
                    53,
                    154,
                    57,
                    71,
                    64,
                    75,
                    72,
                    39,
                    47,
                    52,
                    73,
                    89,
                    156,
                    86,
                    105,
                    88,
                    45,
                    33,
                    56,
                    142,
                    124,
                    114,
                    64
                ],
                [
                    "y1",
                    22,
                    12,
                    30,
                    40,
                    33,
                    23,
                    18,
                    41,
                    45,
                    69,
                    57,
                    61,
                    70,
                    47,
                    31,
                    34,
                    40,
                    55,
                    27,
                    57,
                    48,
                    32,
                    40,
                    49,
                    54,
                    49,
                    34,
                    51,
                    51,
                    51,
                    66,
                    51,
                    94,
                    60,
                    64,
                    28,
                    44,
                    96,
                    49,
                    73,
                    30,
                    88,
                    63,
                    42,
                    56,
                    67,
                    52,
                    67,
                    35,
                    61,
                    40,
                    55,
                    63,
                    61,
                    105,
                    59,
                    51,
                    76,
                    63,
                    57,
                    47,
                    56,
                    51,
                    98,
                    103,
                    62,
                    54,
                    104,
                    48,
                    41,
                    41,
                    37,
                    30,
                    28,
                    26,
                    37,
                    65,
                    86,
                    70,
                    81,
                    54,
                    74,
                    70,
                    50,
                    74,
                    79,
                    85,
                    62,
                    36,
                    46,
                    68,
                    43,
                    66,
                    50,
                    28,
                    66,
                    39,
                    23,
                    63,
                    74,
                    83,
                    66,
                    40,
                    60,
                    29,
                    36,
                    27,
                    54,
                    89,
                    50,
                    73,
                    52
                ]
            ],
            "types":{
                "y0":"line",
                "y1":"line",
                "x":"x"
            },
            "names":{
                "y0":"#0",
                "y1":"#1"
            },
            "colors":{
                "y0":"#3DC23F",
                "y1":"#F34C44"
            }
        }
    ],
    ctx = null,
    mainCanvas = null,
    controlCanvas = null;

// Controls
naviLctrl.addEventListener('mousedown', function (e) {
    pageX = e.pageX;
    e.preventDefault();
    window.addEventListener('mousemove', lCtrlMove);
    window.addEventListener('mouseup', ctrlStop);
});
naviRctrl.addEventListener('mousedown', function (e) {
    pageX = e.pageX;
    e.preventDefault();
    window.addEventListener('mousemove', rCtrlMove);
    window.addEventListener('mouseup', ctrlStop);
});
naviWin.addEventListener('mousedown', function (e) {
    pageX = e.pageX;
    e.preventDefault();
    window.addEventListener('mousemove', winMove);
    window.addEventListener('mouseup', ctrlStop);
});

if (canvas.getContext){
    ctx = canvas.getContext('2d'),
        mainCanvas = {
            width: canvas.width,
            height: 400,
            start: {
                x: 0,
                y: 420
            },
            lineWidth: 2
        },
        controlCanvas = {
            width: canvas.width,
            height: 100,
            start: {
                x: 0,
                y: canvas.height - 10
            },
            lineWidth: 1
        };

    //ctx.translate(0.5, 0.5);

    controlCanvasObj = drawCanvas(ctx, controlCanvas, gDataAll[0]);

    drawCanvas(ctx, mainCanvas, gDataAll[0], [
        Math.floor(naviLmaskWidth / controlCanvasObj.xMult),
        Math.floor(naviRmaskWidth / controlCanvasObj.xMult)
    ], true);
}

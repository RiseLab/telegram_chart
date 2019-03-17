function loadJSON(filename, callback) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState === 4 && xobj.status === 200) {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function lCtrlMove (e) {
    let pageXChange = pageX - e.pageX;
    if ((naviWinWidth + pageXChange >= 100) && (naviLmaskWidth - pageXChange >= 0)) {
        naviWin.style.width = naviWinWidth + pageXChange + 'px';
        naviLmask.style.width = naviLmaskWidth - pageXChange + 'px';

        drawCanvas(ctx, mainCanvas, gData, [
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

        drawCanvas(ctx, mainCanvas, gData, [
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

        drawCanvas(ctx, mainCanvas, gData, [
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

function drawCanvas (context, settings, data, dataTrim = [0, 0], main = false) {
    let ctx = context,
        gData = data,
        gDates = [],
        gLines = [],
        yMax = 0;

    gData.columns.forEach(function (colItem, index) {
        // if (!gData.show[index]) {
        //     return;
        // }
        let colName = colItem[0],
            colType = gData.types[colName],
            colItemCp = colItem.slice(dataTrim[0] || 1, dataTrim[1] ? (-1 * dataTrim[1]) : colItem.length);
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

    if (main) {
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

function drawGraphBtn (line, index, gData) {
    let label = document.createElement('label'),
        input = document.createElement('input'),
        text = document.createTextNode(line.name);
    label.classList.add('graph-buttons__btn');
    input.type = 'checkbox';
    input.value = index;
    input.checked = true;
    input.addEventListener('change', function (e) {
        gData.show[this.value] = this.checked;
    });
    label.appendChild(input);
    label.appendChild(text);
    graphButtons.appendChild(label);
}

let canvas = document.getElementById('graph'),
    naviLmask = document.getElementsByClassName('graph-navi__lmask')[0],
    naviRmask = document.getElementsByClassName('graph-navi__rmask')[0],
    naviLctrl = document.getElementsByClassName('graph-navi__lctrl')[0],
    naviRctrl = document.getElementsByClassName('graph-navi__rctrl')[0],
    naviWin = document.getElementsByClassName('graph-navi__win')[0],
    graphButtons = document.getElementsByClassName('graph-buttons')[0],
    naviWinWidth = naviWin.clientWidth,
    naviLmaskWidth = naviLmask.clientWidth,
    naviRmaskWidth = naviRmask.clientWidth,
    pageX = 0,
    gDataAll = null,
    gData = null,
    ctx = null,
    mainCanvas = null,
    controlCanvas = null,
    controlCanvasObj = null;

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

document.addEventListener('DOMContentLoaded', function () {

    loadJSON('graphs.json', function (response) {
        gDataAll = JSON.parse(response);
        gData = gDataAll[0];
        gData.show = [];

        if (canvas.getContext) {
            ctx = canvas.getContext('2d');
            mainCanvas = {
                    width: canvas.width,
                    height: 400,
                    start: {
                        x: 0,
                        y: 420
                    },
                    lineWidth: 2
                };
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

            controlCanvasObj = drawCanvas(ctx, controlCanvas, gData);

            controlCanvasObj.lines.forEach(function (item, index) {
                drawGraphBtn(item, index, gData);
                gData.show.push(true);
            });

            drawCanvas(ctx, mainCanvas, gData, [
                Math.floor(naviLmaskWidth / controlCanvasObj.xMult),
                Math.floor(naviRmaskWidth / controlCanvasObj.xMult)
            ], true);
        }
    });
});

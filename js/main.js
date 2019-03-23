class KeiChart {
    settings = {
        container: null,
        height: 0,
        width: 0,
        minWidth: 320,
        gData: null,
        main: {
            lineWidth: 2
        },
        ctrl: {
            height: 100,
            lineWidth: 1,
            winWidth: 140,
            lines: []
        }
    };

    constructor (options) {
        this.settings.container = options.container || document.body;
        this.settings.width = options.width || Math.max(this.settings.minWidth, this.settings.container.clientWidth);
        this.settings.height = options.height || (this.settings.width * 0.75);

        let elem = (this.element = document.createElement('div')),
            mainCnvs = (this.mainCanvas = document.createElement('canvas')),
            ctrlCnvs = (this.controlCanvas = document.createElement('canvas')),
            gridMask = document.createElement('div'),
            buttons = document.createElement('div'),
            navi = document.createElement('div'),
            naviLmask = document.createElement('div'),
            naviRmask = document.createElement('div'),
            naviLctrl = document.createElement('div'),
            naviRctrl = document.createElement('div'),
            naviWin = document.createElement('div'),
            naviWinWidth = this.settings.ctrl.winWidth,
            naviLmaskWidth = this.settings.width - this.settings.ctrl.winWidth - 20,
            naviRmaskWidth = 0,
            pageX = 0;

        let lCtrlMove = (e) => {
                let pageXChange = pageX - (e.pageX || e.touches[0].pageX);
                if ((naviWinWidth + pageXChange >= 100) && (naviLmaskWidth - pageXChange >= 0)) {
                    naviWin.style.width = naviWinWidth + pageXChange + 'px';
                    naviLmask.style.width = naviLmaskWidth - pageXChange + 'px';

                    this.renderMain(
                        Math.floor((naviLmaskWidth - pageXChange) /  this.settings.ctrl.xMult),
                        Math.floor(naviRmaskWidth /  this.settings.ctrl.xMult)
                    );
                }
            },
            rCtrlMove = (e) => {
                let pageXChange = pageX - (e.pageX || e.touches[0].pageX);
                if ((naviWinWidth - pageXChange >= 100) && (naviRmaskWidth + pageXChange >= 0)) {
                    naviWin.style.width = naviWinWidth - pageXChange + 'px';
                    naviRmask.style.width = naviRmaskWidth + pageXChange + 'px';

                    this.renderMain(
                        Math.floor(naviLmaskWidth /  this.settings.ctrl.xMult),
                        Math.floor((naviRmaskWidth + pageXChange) / this.settings.ctrl.xMult)
                    );
                }
            },
            winMove = (e) => {
                let pageXChange = pageX - (e.pageX || e.touches[0].pageX);
                if ((naviLmaskWidth - pageXChange >= 0) && (naviRmaskWidth + pageXChange >= 0)) {
                    naviLmask.style.width = (naviLmaskWidth - pageXChange) + 'px';
                    naviRmask.style.width = (naviRmaskWidth + pageXChange) + 'px';

                    this.renderMain(
                        Math.floor((naviLmaskWidth - pageXChange) /  this.settings.ctrl.xMult),
                        Math.floor((naviRmaskWidth + pageXChange) / this.settings.ctrl.xMult)
                    );
                }
            },
            ctrlStop = function (e) {
                window.removeEventListener('mousemove', lCtrlMove);
                window.removeEventListener('touchmove', lCtrlMove);
                window.removeEventListener('mousemove', rCtrlMove);
                window.removeEventListener('touchmove', rCtrlMove);
                window.removeEventListener('mousemove', winMove);
                window.removeEventListener('touchmove', winMove);
                naviWinWidth = naviWin.clientWidth;
                naviLmaskWidth = naviLmask.clientWidth;
                naviRmaskWidth = naviRmask.clientWidth;
                pageX = 0;
            };

        this.settings.gData = options.data;

        if (options.data.columns) {
            options.data.columns.forEach((item) => {
                if (item[0] !== 'x') {
                    let label = document.createElement('label'),
                        input = document.createElement('input'),
                        fakeCheckbox = document.createElement('div'),
                        text = document.createElement('span');
                    label.classList.add('kei-chart__buttons__btn');
                    text.classList.add('kei-chart__buttons__text');
                    text.innerText = item[0];
                    fakeCheckbox.classList.add('kei-chart__buttons__fake-checkbox');
                    fakeCheckbox.innerText = '✔';
                    fakeCheckbox.style.backgroundColor = options.data['colors'][ item[0] ];
                    fakeCheckbox.style.borderColor = options.data['colors'][ item[0] ];
                    input.type = 'checkbox';
                    input.value = item[0];
                    input.checked = true;
                    input.addEventListener('change', (e) => {
                        let checkbox = e.target;
                        if (checkbox.closest('.kei-chart__buttons').querySelectorAll('input:checked').length === 1) {
                            checkbox.closest('.kei-chart__buttons').querySelector('input:checked').disabled = true;
                        } else {
                            checkbox.closest('.kei-chart__buttons').querySelectorAll('input:checked').forEach(item => {
                                item.disabled = false;
                            });
                        }
                        this.settings.ctrl.lines[checkbox.value].visible = checkbox.checked;
                        this.renderControl();
                        this.renderMain(
                            Math.floor(naviLmaskWidth / this.settings.ctrl.xMult),
                            Math.floor(naviRmaskWidth / this.settings.ctrl.xMult)
                        );
                    });
                    label.appendChild(input);
                    label.appendChild(fakeCheckbox);
                    label.appendChild(text);
                    buttons.appendChild(label);
                    this.settings.ctrl.lines[ item[0] ] = {
                        color: options.data['colors'][ item[0] ],
                        visible: true
                    }
                }
            });
        }

        elem.classList.add('kei-chart');
        elem.style.height = this.settings.height + 'px';
        elem.style.width = this.settings.width + 'px';

        mainCnvs.classList.add('kei-chart__main-canvas');
        mainCnvs.width = this.settings.width;
        mainCnvs.height = this.settings.height - this.settings.ctrl.height;

        ctrlCnvs.classList.add('kei-chart__control-canvas');
        ctrlCnvs.width = this.settings.width;
        ctrlCnvs.height = this.settings.ctrl.height;

        buttons.classList.add('kei-chart__buttons');

        gridMask.classList.add('kei-chart__grid-mask');

        navi.classList.add('kei-chart__navi');
        naviLmask.classList.add('kei-chart__navi__lmask');
        naviRmask.classList.add('kei-chart__navi__rmask');
        naviLctrl.classList.add('kei-chart__navi__lctrl');
        naviRctrl.classList.add('kei-chart__navi__rctrl');
        naviWin.classList.add('kei-chart__navi__win');

        navi.appendChild(naviLmask);
        navi.appendChild(naviLctrl);
        navi.appendChild(naviWin);
        navi.appendChild(naviRctrl);
        navi.appendChild(naviRmask);

        elem.appendChild(mainCnvs);
        elem.appendChild(ctrlCnvs);
        elem.appendChild(buttons);
        elem.appendChild(gridMask);
        elem.appendChild(navi);

        naviLctrl.addEventListener('mousedown', (e) => {
            pageX = e.pageX;
            e.preventDefault();
            window.addEventListener('mousemove', lCtrlMove);
        });

        naviLctrl.addEventListener('touchstart', (e) => {
            pageX = e.touches[0].pageX;
            e.preventDefault();
            window.addEventListener('touchmove', lCtrlMove);
        });

        naviRctrl.addEventListener('mousedown', (e) => {
            pageX = e.pageX;
            e.preventDefault();
            window.addEventListener('mousemove', rCtrlMove);
        });

        naviRctrl.addEventListener('touchstart', (e) => {
            pageX = e.touches[0].pageX;
            e.preventDefault();
            window.addEventListener('touchmove', rCtrlMove);
        });

        naviWin.addEventListener('mousedown', (e) => {
            pageX = e.pageX;
            e.preventDefault();
            window.addEventListener('mousemove', winMove);
        });

        naviWin.addEventListener('touchstart', (e) => {
            pageX = e.touches[0].pageX;
            e.preventDefault();
            window.addEventListener('touchmove', winMove);
        });

        window.addEventListener('mouseup', ctrlStop);

        window.addEventListener('touchend', ctrlStop);

        window.addEventListener('resize', (e) => {
            this.settings.width = Math.max(this.settings.minWidth, this.settings.container.clientWidth);
            this.settings.height = this.settings.width * 0.75;

            naviWinWidth = this.settings.ctrl.winWidth;
            naviLmaskWidth = this.settings.width - this.settings.ctrl.winWidth - 20;
            naviRmaskWidth = 0;

            naviWin.style.width = naviWinWidth + 'px';
            naviRmask.style.width = '0';

            elem.style.height = this.settings.height + 'px';
            elem.style.width = this.settings.width + 'px';

            mainCnvs.width = ctrlCnvs.width = this.settings.width;
            mainCnvs.height = this.settings.height - this.settings.ctrl.height;

            this.renderControl();
            this.renderMain(
                Math.floor(naviLmaskWidth / this.settings.ctrl.xMult),
                Math.floor(naviRmaskWidth / this.settings.ctrl.xMult)
            );
        });

        if (this.controlCanvas.getContext) {
            this.settings.main.ctx = mainCnvs.getContext('2d');
            this.settings.ctrl.ctx = ctrlCnvs.getContext('2d');

            this.renderControl();
            this.renderMain(
                Math.floor(naviLmaskWidth / this.settings.ctrl.xMult),
                Math.floor(naviRmaskWidth / this.settings.ctrl.xMult)
            );
        }
    }

    render () {
        this.settings.container.appendChild(this.element);
    }

    renderControl () {
        let ctrlCtx = this.settings.ctrl.ctx,
            gData = this.settings.gData,
            gDates = [],
            gLines = [],
            yMax = 0;

        gData.columns.forEach((colItem) => {
            let colName = colItem[0],
                colType = gData.types[colName],
                colItemCp = colItem.slice(1);
            if (colType === 'x') {
                gDates = colItemCp;
            } else if (colType === 'line' && this.settings.ctrl.lines[colName].visible) {
                gLines.push({
                    name: gData['names'][colName],
                    color: gData['colors'][colName],
                    data: colItemCp
                });
                yMax = Math.max(yMax, Math.max(...colItemCp));
            }
        });

        let segmentsCount = gDates.length - 1,
            xMult = (this.settings.ctrl.xMult = (this.controlCanvas.width / segmentsCount)),
            yMult = (this.controlCanvas.height - 20) / yMax;

        ctrlCtx.clearRect(0, 0, this.controlCanvas.width, this.mainCanvas.height);

        gLines.forEach((gLine) => {
            ctrlCtx.beginPath();
            ctrlCtx.moveTo(0, KeiChart.convertY(gLine.data[0] * yMult, this.controlCanvas.height - 10));
            for (let i = 1; i <= segmentsCount; i++) {
                ctrlCtx.lineTo(i * xMult, KeiChart.convertY(gLine.data[i] * yMult, this.controlCanvas.height - 10));
            }
            ctrlCtx.lineWidth = this.settings.ctrl.lineWidth;
            ctrlCtx.strokeStyle = gLine.color;
            ctrlCtx.stroke();
        });
    }

    renderMain (lTrim = 0, rTrim = 0) {
        let mainCtx = this.settings.main.ctx,
            gData = this.settings.gData,
            gDates = [],
            gLines = [],
            yMax = 0;

        gData.columns.forEach((colItem) => {
            let colName = colItem[0],
                colType = gData.types[colName],
                colItemCp = colItem.slice(lTrim ? (lTrim + 1) : 1, rTrim ? -rTrim : colItem.length);
            if (colType === 'x') {
                gDates = colItemCp;
            } else if (colType === 'line' && this.settings.ctrl.lines[colName].visible) {
                gLines.push({
                    name: gData['names'][colName],
                    color: gData['colors'][colName],
                    data: colItemCp
                });
                yMax = Math.max(yMax, Math.max(...colItemCp));
            }
        });

        let segmentsCount = gDates.length - 1,
            xMult = this.mainCanvas.width / segmentsCount,
            yMult = (this.mainCanvas.height - 60) / yMax;

        mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

        this.renderGrid(xMult, yMult, gDates);

        gLines.forEach((gLine) => {
            mainCtx.beginPath();
            mainCtx.moveTo(0, KeiChart.convertY(gLine.data[0] * yMult, this.mainCanvas.height - 30));
            for (let i = 1; i <= segmentsCount; i++) {
                mainCtx.lineTo(i * xMult, KeiChart.convertY(gLine.data[i] * yMult, this.mainCanvas.height - 30));
            }
            mainCtx.lineWidth = this.settings.main.lineWidth;
            mainCtx.strokeStyle = gLine.color;
            mainCtx.stroke();
        });
    }

    renderGrid (xMult, yMult, gDates) {
        let mainCtx = this.settings.main.ctx,
            hLinesCount = 6,
            vLinesCount = 6,
            hLineMult = Math.floor(this.mainCanvas.height / (hLinesCount * yMult)),
            vLineMult = Math.floor(this.mainCanvas.width / (vLinesCount * xMult));

        mainCtx.beginPath();
        for (let i = 0; i <= hLineMult * hLinesCount; i += hLineMult) {
            mainCtx.moveTo(10, KeiChart.convertY(i * yMult, this.mainCanvas.height - 30));
            mainCtx.lineTo(this.mainCanvas.width - 10, KeiChart.convertY(i * yMult, this.mainCanvas.height - 30));
            mainCtx.fillText(`${i}`, 15, KeiChart.convertY(i * yMult + 10, this.mainCanvas.height - 30));
        }
        for (let i = 0; i <= vLinesCount; i++) {
            let lineDate = new Date(gDates[i * vLineMult]),
                lineStr = lineDate.toLocaleString('en-us', { month: 'short', day: '2-digit' }).toLowerCase();
            // mainCtx.moveTo(i * vLineMult * xMult, this.mainCanvas.height - 30);
            // mainCtx.lineTo(i * vLineMult * xMult, 0);
            mainCtx.fillText(lineStr, i * vLineMult * xMult - 15, this.mainCanvas.height - 15);
        }
        mainCtx.lineWidth = 1;
        mainCtx.strokeStyle = '#d3d3d3';
        mainCtx.stroke();
    }

    static convertY (y, y0) { return y0 - y; }
}

KeiChartNew = function (options) {
    let cfg = {
        container: options.container || document.body,
        height: 0,
        width: 0,
        minWidth: 320,
        gData: null,
        main: {
            lineWidth: 2
        },
        ctrl: {
            height: 100,
            lineWidth: 1,
            winWidth: 140,
            lines: []
        }
    };
    let elem = document.createElement('div');

    cfg.width = options.width || Math.max(cfg.minWidth, cfg.container.clientWidth);
    cfg.height = cfg.height = options.height || (cfg.width * 0.75);
};

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

document.addEventListener('DOMContentLoaded', function () {
    loadJSON('graphs.json', function (response) {
        let graphsData = JSON.parse(response);
        for (let i = 0; i <= 0; i++) {
            let chart = new KeiChart({
                data: graphsData[i],
                container: document.getElementsByClassName('charts-view__chart')[i]
            });
            chart.render();
        }
    });
});

var colors = ['#f00', '#44f'];

var pts = [
    [0.01, 1/2],
    [1/3, 0.01],
    [2/3, 0.01],
    [0.99, 1/2],
    [2/3, 0.99],
    [1/3, 0.99],
];

var lines = [];

var ptSize;

var ptStart;

var drawing = null;

var lastTouch = {};

var side = 0;

var gameLost = null;

function setup() {
    var w = windowWidth;
    var h = windowHeight;
    if (typeof(simGamePrepare) == 'function') {
        simGamePrepare();
        var div = document.getElementById('sim-game-parent');
        w = div.clientWidth;
        h = div.clientHeight;
        alert('prepare ' + w + ' ' + h);
    }
    var cnv = createCanvas(w, h);
    cnv.parent('sim-game-parent');
    recalcSizes();
    noLoop();
}

function mousePressed() {
    drawing = 'mouse';
    pointerPressed(mouseX, mouseY);
}

function touchStarted() {
    drawing = 'touch';
    pointerPressed(touches[0].x, touches[0].y);
}

function pointerPressed(x, y) {
    ptStart = detectPoint(x, y);
    loop();
}

function mouseReleased() {
    pointerReleased(mouseX, mouseY);
}

function touchEnded() {
    pointerReleased(lastTouch.x, lastTouch.y);
}

function pointerReleased(x, y) {
    drawing = null;
    noLoop();
    var ptEnd = detectPoint(x, y);
    if (ptStart >= 0 && ptEnd >= 0 && ptStart != ptEnd) {
        humanMove(ptStart, ptEnd);
    }
    ptStart = -1;
    redraw();
}

function humanMove(p1, p2) {
    if (lines.every(ln => ln[0] != p1 || ln[1] != p2)) {
        lines.push([p1, p2, side]);
        lines.push([p2, p1, side]);
        checkLoss(p1, p2);
        side = 1 - side;
    } else {
        alert('Hey, already line here!\nDon\'t you see?');
    }
}

function checkLoss(p1, p2) {
    for (var p = 0; p < 6; p++) {
        if (lines.some(ln => ln[0] == p && ln[1] == p1 && ln[2] == side)
            && lines.some(ln => ln[0] == p && ln[1] == p2 && ln[2] == side)) {
            gameLost = [p, p1, p2, side];
            alert('Game lost by ' + (side == 0 ? 'red' : 'blue') +
                '\nRefresh window to restart');
            break;
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    recalcSizes();
    redraw();
}

function recalcSizes() {
    ptSize = Math.round(Math.min(width, height) / 10);
    pts.forEach(p => {
        p[2] = Math.round(width * p[0]);
        p[3] = Math.round(height * p[1]);
    });
}

function pointer() {
    if (drawing == 'mouse') {
        return {x: mouseX, y: mouseY};
    } else if (drawing == 'touch') {
        lastTouch = {x: touches[0].x , y: touches[0].y};
        return lastTouch;
    }
    return null;
}

function draw() {
    clear();
    strokeWeight(5);
    lines.forEach(ln => {
        if (ln[0] < ln[1]) {
            stroke(colors[ln[2]]);
            line(pts[ln[0]][2], pts[ln[0]][3], pts[ln[1]][2], pts[ln[1]][3]);
        }
    });
    strokeWeight(1);
    stroke('#000');
    fill('#fff');
    pts.forEach(p => circle(p[2], p[3], ptSize));
    if (gameLost !== null) {
        fill(colors[gameLost[3]]);
        gameLost.slice(0, 3).forEach(p => circle(pts[p][2], pts[p][3], ptSize));
    }
    if (drawing !== null && ptStart > -1) {
        stroke(colors[side]);
        var ptr = pointer();
        line(pts[ptStart][2], pts[ptStart][3], ptr.x, ptr.y);
    }
}

function detectPoint(x, y) {
    return pts.findIndex(p => {
        return Math.hypot(p[2] - x, p[3] - y) < ptSize / 2;
    });
}


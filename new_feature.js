const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const brushColorInput = document.getElementById("brushColor");
const brushSizeInput = document.getElementById("brushSize");
const backgroundColorInput = document.getElementById("backgroundColor");
const eraseButton = document.getElementById("eraseButton");
const selectButton = document.getElementById("selectButton");
const moveButton = document.getElementById("moveButton");
const undoButton = document.getElementById("undoButton");
const clearButton = document.getElementById("clearButton");
const saveButton = document.getElementById("saveButton");
let isDrawing = false;
let isErasing = false;
let isSelecting = false;
let isMoving = false;
let selectionStart = null;
let selectedArea = null;
let selectedImage = null;
let strokes = [];
let selectionActive = false;

canvas.width = 800;
canvas.height = 500;
ctx.fillStyle = backgroundColorInput.value;
ctx.fillRect(0, 0, canvas.width, canvas.height);

canvas.addEventListener("mousedown", (e) => {
    if (isSelecting) {
        selectionStart = { x: e.offsetX, y: e.offsetY };
        selectionActive = true;
        return;
    }
    if (!isMoving) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (isSelecting && selectionStart && selectionActive) {
        redrawCanvas();
        ctx.setLineDash([6]);
        ctx.strokeStyle = "red";
        ctx.strokeRect(
            selectionStart.x,
            selectionStart.y,
            e.offsetX - selectionStart.x,
            e.offsetY - selectionStart.y
        );
        return;
    }
    if (isDrawing) {
        ctx.strokeStyle = isErasing ? backgroundColorInput.value : brushColorInput.value;
        ctx.lineWidth = brushSizeInput.value;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

canvas.addEventListener("mouseup", (e) => {
    if (isSelecting && selectionStart) {
        selectedArea = {
            x: selectionStart.x,
            y: selectionStart.y,
            width: e.offsetX - selectionStart.x,
            height: e.offsetY - selectionStart.y,
        };
        selectedImage = ctx.getImageData(
            selectedArea.x,
            selectedArea.y,
            selectedArea.width,
            selectedArea.height
        );
        selectionStart = null;
        isSelecting = false;
        selectionActive = false;
        return;
    }
    isDrawing = false;
    ctx.closePath();
    strokes.push(canvas.toDataURL());
});

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColorInput.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = strokes[strokes.length - 1] || "";
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
        if (selectedArea && selectedImage) {
            ctx.putImageData(selectedImage, selectedArea.x, selectedArea.y);
        }
    };
}

selectButton.addEventListener("click", () => {
    isSelecting = !isSelecting;
    isMoving = false;
    selectButton.textContent = isSelecting ? "Stop Selecting" : "Select";
});

moveButton.addEventListener("click", () => {
    isMoving = !isMoving;
    moveButton.textContent = isMoving ? "Stop Moving" : "Move Selection";
    if (isMoving && selectedArea) {
        canvas.addEventListener("mousemove", moveSelection);
    } else {
        canvas.removeEventListener("mousemove", moveSelection);
    }
});

function moveSelection(e) {
    if (isMoving && selectedArea) {
        selectedArea.x = e.offsetX - selectedArea.width / 2;
        selectedArea.y = e.offsetY - selectedArea.height / 2;
        redrawCanvas();
    }
}
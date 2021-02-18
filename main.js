$(document).ready(function() {
    var numOfSticker = 3;

    // Input Field Name Change - for tray image
    inputFieldTextChange("tray_image");
    // Preview for tray image
    previewCanvas(0);
    previewDefault(0, "Tray icon\nnot selected");

    // Stickers 1-3
    for(i = 0; i < numOfSticker; i++){
        createStickerInput(i+1);
        previewCanvas(i+1);
        previewDefault(i+1, "Sticker "+(i+1)+"\nnot selected");
    }

    // Handling "+" event
    $('#add').on('click', function(){
        if(numOfSticker < 30){
            numOfSticker ++;
            createStickerInput(numOfSticker);
            previewCanvas(numOfSticker);
            previewDefault(numOfSticker, "Sticker "+numOfSticker+"\nnot selected");
        }
    });

    // Handling "-" event
    $('#remove').on('click', function(){
        if(numOfSticker > 3){
            numOfSticker --;
            $("#sticker-"+(numOfSticker+1)+"-div").remove();
            $(`#canvas-${numOfSticker+1}`).remove();
        }
    });

    // Handling "submit" event
    $('#form').on('submit', function(e){
        var num = numOfSticker;
        var tempNum = 0;

        // Prevent default action
        e.preventDefault();
        
        var json = {};
        json["stickers"] = [];
        $('input').each(function() {
            if($(this).attr('id').includes("input-image-")){
                var obj = {};
                convertString(this, 512).then(function(result){
                    obj["image_data"] = result;
                    tempNum += 1;
                    if(tempNum == num + 1){exportToJsonFile(json);}
                });
                obj["emojis"] = [];
                json["stickers"].push(obj);
            }
            else if($(this).attr('id').includes("tray_image")){
                var idName = $(this).attr('id');
                convertString(this, 96).then(function(result){
                    json[idName] = result;
                    tempNum += 1;
                    if(tempNum == num + 1){exportToJsonFile(json);}
                });
            }
            else{
                json[$(this).attr('id')] = $(this).val();
            }
        });
    });
    
});

// Create Sticker Input
function createStickerInput(num) {
    const inputElement = `<div class="input-group mb-3" id="sticker-${num}-div"><div class="input-group-prepend"><span class="input-group-text" id="sticker-${num}-name">sticker ${num}</span></div><div class="custom-file"><input type="file" class="custom-file-input" id="input-image-sticker-${num}" accept="image/*" required><label class="custom-file-label" for="input-image-sticker-${num}" id="label-image-sticker-${num}">Choose file</label></div></div>`;
    const div = $("#allStickers");
    div.append(inputElement);

    // Event Listener
    inputFieldTextChange(`input-image-sticker-${num}`);
}

// Input Field Text Change
function inputFieldTextChange(name) {
    $(`#${name}`).change(async function(e){
        var num = (name === "tray_image") ? 0 : name.replace('input-image-sticker-','');
        var msg = (name === "tray_image") ? "Tray icon\nnot selected" : "Sticker "+num+"\nnot selected";
        if(e.target.files[0]){
            $("label[for = "+e.target.id+"]").text(e.target.files[0].name);
            previewImage(num, this);
        }
        else{
            $("label[for = "+e.target.id+"]").text("Choose file");
            previewDefault(num, msg);
        }
    });
}

// Create Preview Canvas
function previewCanvas(num) {
    const inputElement = `<canvas id="canvas-${num}" class="m-2" width="120" height="120"></canvas>`;
    const div = $("#displayWebp");
    div.append(inputElement);
}

// Display default
function previewDefault(num, msg) {
    var canvas = document.getElementById(`canvas-${num}`);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#AAA";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";

    // Display multiple lines
    var lines = msg.split('\n');
    var lineheight = 20;
    for(var i = 0; i<lines.length; i++){
        ctx.fillText(lines[i], canvas.width/2, canvas.height/2 - (lines.length-1)*0.5*lineheight + (i*lineheight));
    }
    
}

// Display img
function previewImage(num, input) {
    var canvas = document.getElementById(`canvas-${num}`);
    var ctx = canvas.getContext("2d");

    // Clear text
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Display image
    var file, fr;
    file = input.files[0];
    fr = new FileReader();
    fr.onload = function () {
        img = new Image();
        img.onload = function () {// draw and center it
            drawImageScaled(img, ctx);
        }
        img.onerror = function() {
            reject(new Error('image not loaded'));
        };
        img.src = fr.result;
    }
    fr.readAsDataURL(file);
}

// Convert image into string
function convertString(input, res) {
    return new Promise(function(resolve, reject) {
    var file, fr, img, outputString;
    file = input.files[0];
    fr = new FileReader();
    fr.onload = function () {
        img = new Image();
        img.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = res;
            canvas.height = res;
            var ctx = canvas.getContext("2d");

            // draw and center it
            drawImageScaled(img, ctx);

            // convert to string
            outputString = canvas.toDataURL("image/webp");
            outputString = outputString.replace("data:image/webp;base64,", "");
            resolve(outputString);
        }
        img.onerror = function() {
            reject(new Error('image not loaded'));
        };
        img.src = fr.result;
    }
    fr.readAsDataURL(file);
    });
}

// Draw & center the image to a canvas
function drawImageScaled(img, ctx) {
    var canvas = ctx.canvas;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.min(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

// Export to JSON
function exportToJsonFile(jsonData) {
    let dataStr = JSON.stringify(jsonData).replaceAll(/\//g, '\\/');
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = 'data.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}
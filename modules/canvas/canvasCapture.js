

var captureCanvas = function() {
	var imageSrc = canvas.toDataURL();
	var imgObj = canvas.children["canvasImg"] || document.createElement("img");
	imgObj.src = imageSrc;
	imgObj.height = canvas.height;
	imgObj.width = canvas.width;
	imgObj.style = canvas.style;
	if (imgObj.id !== "canvasImg") {
		imgObj.id = "canvasImg"
		canvas.append(imgObj);
	}
}

var observer = new MutationObserver(captureCanvas);
var canvasElements = document.getElementsByTagName("canvas");
if (canvasElements.length > 0) {
	var canvas = canvasElements[0];
	observer.observe(canvas, { attributes: true });
}

var highestOrder = 0;

function sortSection (originId, targetId) {
	var originOrdertag = document.getElementById(originId + "order");
	var targetOrdertag = document.getElementById(targetId + "order");

	var originOrder = parseInt(originOrdertag.innerHTML);
	var targetOrder = parseInt(targetOrdertag.innerHTML);

	if (originOrder >= targetOrder) {
		var newOrder = originOrder + 1;
		targetOrdertag.innerHTML = (originOrder + 1).toString();

		if (newOrder > highestOrder)
			highestOrder = newOrder;

		return 1;
	} else {
		return 0;
	}
}

function sortingPass (interactions) {
	var interactionIndex;
	var passActions = 0;
	var currentInteraction;
	var originId; var targetId; var childIndex;
	var currentChild;


	for(interactionIndex = 0; 
		interactionIndex < interactions.length;
		interactionIndex++) {

		currentInteraction = interactions[interactionIndex];

		for(childIndex = 0;
			childIndex < currentInteraction.childNodes.length;
			childIndex++) {

			currentChild = currentInteraction.childNodes[childIndex];

			if (currentChild.className == "origin") {
				originId = currentChild.innerHTML;	
			} else if (currentChild.className == "target") {
				targetId = currentChild.innerHTML;
			}
		}

		passActions += sortSection(originId, targetId);
	}

	return passActions;
}

function createLayers () {
	var layerContainer = document.getElementById("serviceview");
	var layerArray = [];
	var layerCounter;

	for(layerCounter = 0;
		layerCounter < highestOrder + 1;
		layerCounter++) {

		var newLayer = document.createElement("div");
		newLayer.className = "servicelayer";
		newLayer.id = "servicelayer" + layerCounter.toString();

		layerContainer.appendChild(newLayer);
		layerArray.push(newLayer);
	}

	return layerArray;
}

function fillLayers (layers) {
	var orderTags = document.getElementsByClassName("order");
	var orderIndex;

	for(orderIndex = 0;
		orderIndex < orderTags.length;
		orderIndex++) {

		var orderTag = orderTags[0];

		var order = parseInt(orderTag.innerHTML);

		layers[order].appendChild(orderTag.parentNode);

	}
}

function migrateToOrigin (origins) {
	var originIndex;

	for(originIndex = 0;
		originIndex < origins.length;
		originIndex++) {

		var origin = origins[originIndex];
		var serviceid = origin.innerHTML.trim();

		document.getElementById(serviceid).appendChild(origin.parentNode);
	}
}

function configureCanvas (wireCanvas, exitX, entryX, exitY, entryY) {
	var xDistance = exitX - entryX;
	var yDistance = exitY - entryY;
	var xOffset = Math.min(exitX, entryX) + window.pageXOffset;
	var yOffset = Math.min(exitY, entryY) + window.pageYOffset;

	var width = Math.max(Math.abs(xDistance), 5);
	var height = Math.abs(yDistance);

	wireCanvas.width = width;
	wireCanvas.height = height;
	wireCanvas.style.position = "absolute";
	wireCanvas.style.left = xOffset + "px";
	wireCanvas.style.top = yOffset + "px";
	wireCanvas.style.width = width + "px";
	wireCanvas.style.height = height + "px";
	wireCanvas.style.zIndex = "1000";
	wireCanvas.style.pointerEvents = "none";
}

function drawWire (wireCanvas, exitX, entryX) {
	var wireContext = wireCanvas.getContext("2d");
	wireContext.clearRect(0, 0, wireCanvas.width, wireCanvas.height);

	wireContext.beginPath();
	if (exitX < entryX) {
		wireContext.moveTo(
			0, 0);
		wireContext.bezierCurveTo(
			0, wireCanvas.height / 2,
			wireCanvas.width, wireCanvas.height / 2,
			wireCanvas.width, wireCanvas.height);
	} else if (exitX > entryX) {
		wireContext.moveTo(
			wireCanvas.width, 0);
		wireContext.bezierCurveTo(
			wireCanvas.width, wireCanvas.height / 2,
			0, wireCanvas.height / 2,
			0, wireCanvas.height);		
	} else {
		wireContext.moveTo(
			0, 0);
		wireContext.lineTo(
			0, wireCanvas.height);
	}
	wireContext.stroke();
}

function getConnectPositions (exitPoint, entryPoint) {
	var exitRect = exitPoint.getBoundingClientRect();
	var entryRect = entryPoint.getBoundingClientRect();

	return {
		exitX: (exitRect.right + exitRect.left) / 2,
		entryX: (entryRect.right + entryRect.left) / 2,
		exitY: (exitRect.bottom * 4 + exitRect.top) / 5,
		entryY: (entryRect.bottom + entryRect.top * 2) / 3
	};
}

function getRightCanvas (wireBox, canvasId) {
	var wireCanvas = document.getElementById(canvasId);
	
	if (!wireCanvas) {
		wireCanvas = document.createElement("canvas");	
		wireCanvas.id = canvasId;
		wireBox.appendChild(wireCanvas);
	}

	return wireCanvas;
}

function drawWires (wireBox, exitPoints) {
	var exitIndex;

	for(exitIndex = 0;
		exitIndex < exitPoints.length;
		exitIndex++) {

		var exitPoint = exitPoints[exitIndex];
		var entryPoint = document.getElementById(exitPoint.id.replace("to", "is"));
		
		if (!entryPoint.className.startsWith("attached")) {
			entryPoint.className = "attached " + entryPoint.className;
		}		

		var connectors = getConnectPositions(exitPoint, entryPoint);

		var canvasId = exitPoint.parentNode.id.replace("int", "cnv");
		var wireCanvas = getRightCanvas(wireBox, canvasId);

		configureCanvas(wireCanvas, 
			connectors.exitX, connectors.entryX, 
			connectors.exitY, connectors.entryY);

		drawWire(wireCanvas, connectors.exitX, connectors.entryX);
	}
}

var interactions = document.getElementsByClassName("interaction");

while(sortingPass(interactions));

var origins = document.getElementsByClassName("origin");

migrateToOrigin(origins);

var layers = createLayers();

fillLayers(layers);

var wireBox = document.getElementById("wires");
var exitPoints = document.getElementsByClassName("exitpoint");

drawWires(wireBox, exitPoints);

window.onresize = function(event) {
	drawWires(wireBox, exitPoints);
};
var drawinginvalidated = [];

function handleInvalidateWith (f) {
	drawinginvalidated.push(f);
}

function causeInvalidate () {
	var currentFIdx;

	for(currentFIdx = 0;
		currentFIdx < drawinginvalidated.length;
		currentFIdx++) {

		drawinginvalidated[currentFIdx]();
	}
}
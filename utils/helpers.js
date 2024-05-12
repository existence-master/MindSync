const extractVideoId = (url) => {
	// Regular expression to match YouTube URL formats
	var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	var match = url.match(regExp);

	// If match is found, return the video ID (the second element of the match array)
	if (match && match[2].length === 11) {
		return match[2];
	} else {
		// Handle invalid or unrecognized YouTube URL formats
		return null;
	}
};

export { extractVideoId };
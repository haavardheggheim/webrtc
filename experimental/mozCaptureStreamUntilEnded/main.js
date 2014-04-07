var mediaConstraints = {
	optional: [],
	mandatory: {
		OfferToReceiveAudio: true,
		OfferToReceiveVideo: true
	}
};



var offerer, answerer;
var offererToAnswerer = document.getElementById('peer1-to-peer2');
var answererToOfferer = document.getElementById('peer2-to-peer1');

window.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
window.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.URL = window.webkitURL || window.URL;

window.iceServers = {
    iceServers: [{
            url: 'stun:23.21.150.121'
        }
    ]
};







/* offerer */

function offererPeer(stream, preRecordedMediaStream) {
    offerer = new RTCPeerConnection(window.iceServers);
    offerer.addStream(stream);
console.log('added normal media stream for offerer', stream);

    offerer.onaddstream = function (event) {
offererToAnswerer.src = URL.createObjectURL(event.stream);
        offererToAnswerer.play();
    };

    offerer.onicecandidate = function (event) {
        if (!event || !event.candidate) return;
        answerer.addIceCandidate(event.candidate);
    };

    offerer.createOffer(function (offer) {
        offerer.setLocalDescription(offer);
        answererPeer(offer, preRecordedMediaStream);
    }, onSdpError, mediaConstraints);
}



/* answerer */

function answererPeer(offer, preRecordedMediaStream) {
    answerer = new RTCPeerConnection(window.iceServers);
    answerer.addStream(preRecordedMediaStream);
console.log('added pre-recorded media stream for answerer', preRecordedMediaStream);

    answerer.onaddstream = function (event) {
answererToOfferer.src = URL.createObjectURL(event.stream);
        answererToOfferer.play();
    };

    answerer.onicecandidate = function (event) {
        if (!event || !event.candidate) return;
        offerer.addIceCandidate(event.candidate);
    };

    answerer.setRemoteDescription(offer);
    answerer.createAnswer(function (answer) {
        answerer.setLocalDescription(answer);
        offerer.setRemoteDescription(answer);
    }, onSdpError, mediaConstraints);
}

function onSdpError(error) {
    alert ( JSON.stringify (error ) );
}





var preRecordedMedia = document.getElementById('pre-recorded-media');

document.getElementById('stream-pre-recorded-media').onclick = function() {
	this.disabled = true;
	document.getElementById('videos-container').style.display = 'block';

	var preRecordedMediaStream = preRecordedMedia.mozCaptureStreamUntilEnded();
	setTimeout(function() {
		navigator.mozGetUserMedia({
			audio: true,
			video: true
		}, function(stream) {
			offererPeer(stream, preRecordedMediaStream);
		}, function(error) {
			console.error(error);
		});
	}, 5000);

	window.preRecordedMediaStream = preRecordedMediaStream;

};




window.onunload = function() {
	document.getElementById('stream-pre-recorded-media').disabled = false;
};
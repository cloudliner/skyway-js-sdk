$(function() {
  let localStream = null;
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: {
        width: { min: 640, ideal: 1280 },
        height: { min: 480, ideal: 720 },
      },
    })
    .then(function(stream) {
      $('#myStream').get(0).srcObject = stream;
      localStream = stream;
    })
    .catch(function(error) {
      console.error('mediaDevice.getUserMedia() error:', error);
      return;
    });
});

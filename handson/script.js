$(function() {
  let localStream = null;
  let peer = null;
  let exsistingCall = null;

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

  peer = new Peer({
    key: '77c7d4df-e243-42e6-8746-b793d309f3b6',
    debug: 3,
  });

  peer.on('open', function() {
    $('#my-id').text(peer.id);
  });

  peer.on('call', function(call) {
    call.answer(localStream);
    setupCallEventHandlers(call);
  });

  peer.on('error', function(err) {
    alert(err.message);
  });

  $('#make-call').submit(function(e) {
    e.preventDefault();
    const call = peer.call($('#peer-id').val(), localStream);
    setupCallEventHandlers(call);
  });

  $('#end-call').click(function() {
    exsistingCall.close();
  });

  function setupCallEventHandlers(call) {
    if (exsistingCall) {
      exsistingCall.close();
    }
    exsistingCall = call;
    call.on('stream', function(stream) {
      addVideo(call, stream);
      setupEndCallUI();
      $('#connected-peer-id').text(call.remoteId);
    });
    call.on('close', function() {
      removeVideo(call.remoteId);
      setupMakeCallUI();
    });
  }

  function addVideo(call, stream) {
    const videoDom = $('<video autoplay>');
    videoDom.attr('id', call.remoteId);
    videoDom.get(0).srcObject = stream;
    $('.videosContainer').append(videoDom);
  }

  function removeVideo(peerId) {
    $('#' + peerId).remove();
  }

  function setupMakeCallUI() {
    $('#make-call').show();
    $('#end-call').hide();
  }

  function setupEndCallUI() {
    $('make-call').hide();
    $('#end-call').show();
  }
});

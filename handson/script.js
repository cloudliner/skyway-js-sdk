$(function() {
  let localStream = null;
  let peer = null;
  let exsistingCall = null;

  let constraints = {
    video: {},
    audio: true,
  };
  constraints.video.width = {
    min: 320,
    max: 320,
  };
  constraints.video.height = {
    min: 240,
    height: 240,
  };
  navigator.mediaDevices
    .getUserMedia(constraints)
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

    /*
    const call = peer.call($('#peer-id').val(), localStream);
     */

    const roomName = $('#join-room').val();
    if (!roomName) {
      return;
    }
    const call = peer.joinRoom(roomName, { mode: 'sfu', stream: localStream});

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

    /*
    call.on('stream', function(stream) {
      addVideo(call, stream);
      setupEndCallUI();
      $('#connected-peer-id').text(call.remoteId);
    });
    call.on('close', function() {
      removeVideo(call.remoteId);
      setupMakeCallUI();
    });
     */

    setupEndCallUI();
    $('#room-id').text(call.name);
    call.on('stream', function(stream) {
      addVideo(call, stream);
    });
    call.on('peerLeave', function(peerId) {
      removeVideo(peerId);
    });
    call.on('close', function() {
      removeAllRemoteViedos();
      setupMakeCallUI();
    });
  }

  function addVideo(call, stream) {
    const videoDom = $('<video autoplay>');

    /*
    videoDom.attr('id', call.remoteId);
     */

    videoDom.attr('id', stream.peerId);
    videoDom.get(0).srcObject = stream;
    $('.videosContainer').append(videoDom);
  }

  function removeVideo(peerId) {
    $('#' + peerId).remove();
  }

  function removeAllRemoteViedos() {
    $('.videosContainer').empty();
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

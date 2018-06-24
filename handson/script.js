$(function() {
  let localStream = null;
  let peer = null;
  let exsistingCall = null;

  const audioSelect = $('#audioSource');
  const videoSelect = $('#videoSource');

  navigator.mediaDevices
    .enumerateDevices()
    .then(function(deviceInfos) {
      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = $('<option>');
        option.val(deviceInfo.deviceId);
        if (deviceInfo.kind === 'audioinput') {
          option.text(deviceInfo.label);
          audioSelect.append(option);
        } else if (deviceInfo.kind === 'videoinput') {
          option.text(deviceInfo.label);
          videoSelect.append(option);
        }
      }
      videoSelect.on('change', setupGetUserMedia);
      audioSelect.on('change', setupGetUserMedia);
      setupGetUserMedia();
    })
    .catch(function(error) {
      console.error('mediaDevice.enumerateDevices() error:', error);
      return;
    });

  function setupGetUserMedia() {
    const audioSource = $('#audioSource').val();
    const videoSource = $('#videoSource').val();
    const constraints = {
      audio: { deviceId: { exact: audioSource } },
      video: { deviceId: { exact: videoSource } },
    };

    if (localStream) {
      localStream = null;
    }
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function(stream) {
        $('#myStream').get(0).srcObject = stream;
        localStream = stream;
        if (exsistingCall) {
          exsistingCall.replaceStream(stream);
        }
      }).catch(function(error) {
        console.error('mediaDevices.getUserMedia() error', error);
        return;
      });
  }

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
    call.on('stream', function(stream) {
      addVideo(stream);
    });
    call.on('removeStream', function(stream) {
      removeVideo(stream.peerId);
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

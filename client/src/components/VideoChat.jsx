import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';

function VideoChat({ socket, user, gameId, opponentId }) {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  // Get user media on component mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { min: 640, ideal: 1280 },
        height: { min: 480, ideal: 720 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    }).then((currentStream) => {
      setStream(currentStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = currentStream;
      }
    }).catch((err) => {
      console.error('Error accessing media devices:', err);
    });
  }, []);

  // Initialize peer connection when stream is available
  useEffect(() => {
    if (!stream || !socket) return;

    // Create peer connection
    const newPeer = new Peer({
      initiator: user.id < opponentId, // Lower ID initiates
      trickle: false,
      stream: stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    });

    setPeer(newPeer);
    peerRef.current = newPeer;

    // Handle signaling
    newPeer.on('signal', (data) => {
      socket.emit('video-signal', {
        gameId,
        signal: data,
        to: opponentId
      });
    });

    // Handle remote stream
    newPeer.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    // Handle connection events
    newPeer.on('connect', () => {
      console.log('Video chat connected!');
    });

    newPeer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    // Listen for remote signals
    socket.on('video-signal', (data) => {
      if (data.gameId === gameId && peerRef.current) {
        peerRef.current.signal(data.signal);
      }
    });

    return () => {
      newPeer.destroy();
      socket.off('video-signal');
    };
  }, [stream, socket, gameId, opponentId, user.id]);

  // Toggle video
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="video-chat-container">
      <div className="video-grid">
        {/* Local video */}
        <div className="video-wrapper local-video">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="video-element"
          />
          <div className="video-label">You</div>
          {!videoEnabled && <div className="video-off-overlay">Camera Off</div>}
        </div>

        {/* Remote video */}
        <div className="video-wrapper remote-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="video-element"
          />
          <div className="video-label">Opponent</div>
          {!remoteStream && <div className="video-loading">Connecting...</div>}
        </div>
      </div>

      {/* Video controls */}
      <div className="video-controls">
        <button
          onClick={toggleVideo}
          className={`control-btn ${videoEnabled ? 'active' : 'inactive'}`}
        >
          {videoEnabled ? '📹' : '📹❌'}
        </button>
        <button
          onClick={toggleAudio}
          className={`control-btn ${audioEnabled ? 'active' : 'inactive'}`}
        >
          {audioEnabled ? '🎤' : '🎤❌'}
        </button>
      </div>
    </div>
  );
}

export default VideoChat;

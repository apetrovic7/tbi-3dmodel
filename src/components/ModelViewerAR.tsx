import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useState, useRef } from 'react';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
import * as THREE from 'three';

function Model() {
  const { scene } = useGLTF('https://localhost:7296/api/models/getModel');
  return <primitive object={scene} scale={1} />;
}

export default function ModelViewer() {
  const [arEnabled, setArEnabled] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isArSessionActive, setIsArSessionActive] = useState(false);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    if (navigator.xr) {
      setArEnabled(true);
    }
  }, []);

  useEffect(() => {
    // Only create the texture after the video stream is available
    if (videoStream && videoRef.current) {
      const texture = new THREE.VideoTexture(videoRef.current);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
      setVideoTexture(texture); // Set the texture for later use in 3D scene
    }
  }, [videoStream]);

  useEffect(() => {
    // Start AR session if it's active and texture is ready
    if (isArSessionActive && videoTexture) {
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      const arButton = ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
      });
      document.body.appendChild(arButton);
    }
  }, [isArSessionActive, videoTexture]);

  const startCamera = async () => {
    try {
      // Access the camera stream and set it to the video element
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setVideoStream(stream); // Set the video stream
      setIsArSessionActive(true); // Activate AR session
    } catch (err) {
      console.error('Error accessing camera: ', err);
    }
  };

  return (
    <div>
      {/* Button to start camera and AR session */}
      <button onClick={startCamera}>Start AR</button>

      {arEnabled && isArSessionActive ? (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          style={{ width: '100vw', height: '100vh' }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} />
          <Suspense fallback={null}>
            <Model />
          </Suspense>
          <OrbitControls />
          {/* Display the video stream as a background or texture */}
          {videoTexture && (
            <mesh>
              <planeGeometry args={[16, 9]} />
              <meshBasicMaterial map={videoTexture} /> {/* Apply the video texture here */}
            </mesh>
          )}
        </Canvas>
      ) : (
        <p>AR is not supported in this browser or camera is not active.</p>
      )}

      {/* Hidden video element to use webcam */}
      <video ref={videoRef} style={{ display: 'none' }} autoPlay muted />
    </div>
  );
}

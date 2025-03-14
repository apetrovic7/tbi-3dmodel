import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import "aframe";
import "ar.js";

function Model() {
  const { scene } = useGLTF("https://localhost:7296/api/models/getModel");
  return <primitive object={scene} scale={1} />;
}

export default function ModelViewerTesting() {
  return (
    <a-scene embedded arjs>
      <a-marker preset="hiro">
        <Canvas>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} />
          <Suspense fallback={null}>
            <Model />
          </Suspense>
          <OrbitControls />
        </Canvas>
      </a-marker>
      <a-entity camera></a-entity>
    </a-scene>
  );
}

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

function Model() {
  const { scene } = useGLTF("https://localhost:7296/api/models/getModel");
  return <primitive object={scene} scale={1} />;
}

export default function ModelViewer() {
  return (
    <Canvas>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}

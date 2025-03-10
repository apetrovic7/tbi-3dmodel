import { useEffect, useRef, Suspense, useState } from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders"; // Required for GLTF/GLB models
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("https://localhost:7296/api/models/getModel"); // Load from backend
  return <primitive object={scene} scale={1} />;
}

const ARViewer = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [xrExperience, setXRExperience] = useState<BABYLON.WebXRDefaultExperience | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const engine = new BABYLON.Engine(canvas, true);
      const scene = new BABYLON.Scene(engine);

      // Create camera for normal mode
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2,
        5,
        BABYLON.Vector3.Zero(),
        scene
      );
      camera.attachControl(canvas, true);

      // Add light source
      new BABYLON.HemisphericLight("light", BABYLON.Vector3.Up(), scene);

      // ✅ Load model from backend
      BABYLON.SceneLoader.ImportMesh(
        "",
        "",
        "https://localhost:7296/api/models/getModel",
        scene,
        (meshes) => {
          console.log("Model loaded successfully:", meshes);
        },
        (progress) => {
          console.log(`Loading progress: ${(progress.loaded / progress.total) * 100}%`);
        },
        (scene, message, exception) => {
          console.error("Error loading model:", message, exception);
        }
      );

      // ✅ Initialize WebXR for AR
      BABYLON.WebXRDefaultExperience.CreateAsync(scene, {
        uiOptions: {
          sessionMode: "immersive-ar", // AR mode
          referenceSpaceType: "local-floor", // Use floor as reference
        },
        optionalFeatures: ["hit-test"], // Allow placing objects on real surfaces
      }).then((xr) => {
        setXRExperience(xr); // Save XR experience for later use
      });

      // Render the scene
      engine.runRenderLoop(() => {
        scene.render();
      });

      // Handle window resize
      window.addEventListener("resize", () => engine.resize());
    }
  }, []);

  // ✅ Function to Start AR Mode
  const startAR = async () => {
    if (xrExperience) {
      try {
        await xrExperience.baseExperience.enterXRAsync("immersive-ar", "local"); // Use "local" instead of "local-floor"
      } catch (error) {
        console.error("WebXR AR failed:", error);
      }
    } else {
      console.error("WebXR not supported on this device/browser.");
    }
  };
  

  return (
    <>
      {/* Button to start AR */}
      <button
        onClick={startAR}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          fontSize: "16px",
          background: "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Start AR
      </button>

      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
};

export default function ModelViewer() {
  return (
    <>
      <ARViewer />

      {/* Your existing 3D scene using react-three-fiber */}
      <Canvas>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </>
  );
}

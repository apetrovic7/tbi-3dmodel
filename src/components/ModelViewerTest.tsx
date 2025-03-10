import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import axios from "axios";

interface BackgroundProps {
  imageUrl: string;
}

function Model() {
  const { scene } = useGLTF("https://localhost:7296/api/models/getModel");

  // Increase the model scale to make it bigger, and adjust its position to sit naturally in the scene
  return <primitive object={scene} scale={[2, 2, 2]} position={[0, 0.5, 0]} />;
}

function Background({ imageUrl }: BackgroundProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping; // Correct mapping for backgrounds
      setTexture(tex);
    });
  }, [imageUrl]);

  if (!texture) return null;

  return (
    <mesh>
      <sphereGeometry args={[25, 15, 10]} /> {/* Make the background smaller (radius 100) */}
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

export default function ModelViewerTest() {
  const [bgImage, setBgImage] = useState<string>("");

  useEffect(() => {
    const generateBackgroundImage = async () => {
      try {
        const response = await axios.post(
          "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2", // Stable Diffusion model endpoint
          {
            inputs: "a wooden table", // Customize the prompt for the background
          },
          {
            headers: {
              "Authorization": `Bearer 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`, // Use your Hugging Face API key
            },
            responseType: "arraybuffer", // Set response type to binary data (arraybuffer)
          }
        );

        // Create a Blob from the binary data in response.data
        const blob = new Blob([response.data], { type: "image/jpeg" });

        // Create an object URL from the Blob
        const imageUrl = URL.createObjectURL(blob);

        setBgImage(imageUrl);
      } catch (error) {
        console.error("Error generating image:", error);
      }
    };

    generateBackgroundImage();
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 1, 5], fov: 50 }} // Adjust camera to fit the background naturally
    >
      <ambientLight intensity={0.6} /> {/* Softer ambient light */}
      <directionalLight position={[5, 5, 5]} intensity={0.8} /> {/* Directional light for a more natural feel */}
      <Suspense fallback={null}>
        <Model />
      </Suspense>
      {bgImage && <Background imageUrl={bgImage} />} {/* Render the background if the image is available */}
      <OrbitControls /> {/* Orbit controls to allow rotating around the model */}
    </Canvas>
  );
}

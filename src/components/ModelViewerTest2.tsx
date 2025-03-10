import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
import axios from "axios";

function Model() {
  const { scene } = useGLTF("https://localhost:7296/api/models/getModel");  // Use HTTPS for consistency
  return <primitive object={scene} scale={3} />;  // Increase the scale of the model to make it bigger
}

export default function ModelViewerTest2() {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("wooden table");  // Example query text
  
  // Fetch background image from Unsplash
  useEffect(() => {
    const fetchBackgroundImage = async () => {
      try {
        const response = await axios.get('https://api.unsplash.com/photos/random', {
          headers: {
            'Authorization': 'Client-ID t-RwKAfXhsy5NSuGytczvYnbIcx_WYBvcwLxgfm70_0' // Replace with your Unsplash API Key
          },
          params: {
            query: searchQuery,  // Use the dynamic search query here
            orientation: 'landscape', // Optional: Adjust orientation
            per_page: 1,
          },
        });

        // Log the fetched data to inspect it
        console.log("Fetched data from Unsplash:", response.data);

        // Accessing the 'regular' image URL
        const imageUrl = response.data.urls.small;  // Use the correct array index here
        if (imageUrl) {
          setBackgroundImage(imageUrl);
        } else {
          console.error("Image URL not found");
        }
      } catch (error) {
        console.error("Error fetching background image:", error);
      }
    };
    
    fetchBackgroundImage();
  }, [searchQuery]);  // Dependency on searchQuery to re-fetch when it changes

  return (
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      backgroundImage: `url(${backgroundImage})`, 
      backgroundSize: "contain", // Make the background smaller
      backgroundPosition: "center" 
    }}>
      <Canvas>
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

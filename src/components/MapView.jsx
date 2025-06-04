// src/components/MapView.jsx
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../utils/firebase";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapView = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-77.0369, 38.9072],
      zoom: 12
    });

    const loadPins = async () => {
      const pinsSnapshot = await getDocs(collection(db, "pins"));
      pinsSnapshot.forEach(doc => {
        const data = doc.data();
        const color = data.state === "green" ? "#00FF00" : data.state === "yellow" ? "#FFFF00" : "#FF0000";

        const el = document.createElement("div");
        el.style.backgroundColor = color;
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";

        el.addEventListener("click", async () => {
          const message = prompt(`Report issue for ${data.name}:`);
          if (message) {
            await addDoc(collection(db, "reports"), {
              pinId: doc.id,
              userId: "anonymous", // Update to actual user ID if logged in
              timestamp: serverTimestamp(),
              status: "open",
              message: message,
              parkGroupId: data.parkGroupId
            });
            alert("Report submitted!");
          }
        });

        new mapboxgl.Marker(el)
          .setLngLat([data.longitude, data.latitude])
          .addTo(map);
      });
    };

    loadPins();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />;
};

export default MapView;

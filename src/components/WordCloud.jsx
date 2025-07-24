import React from "react";
import { getOrderShares } from "../utils/getOrderShares";

// Map normalized app names to logo filenames
function getLogoFilename(app) {
  // Lowercase, remove spaces and special chars for filename
  const key = app.toLowerCase().replace(/[^a-z0-9]/g, "");
  // Map for known exceptions if needed
  const map = {
    deliveroo: "deliveroo.png",
    zapp: "zapp.png",
    "ubereats": "ubereats.png",
    "justeat": "justeat.png",
    foodhub: "foodhub.png",
    "snappyshopper": "snappyshopper.png",
    dishpatch: "dishpatch.png",
    gophr: "gophr.png",
    stuart: "stuart.png",
    glovo: "glovo.png",
    // Add more as needed
  };
  return `/delivery-logos/${map[key] || key + ".png"}`;
}

export default function WordCloud({ data }) {
  const shares = getOrderShares(data)
    .filter(item => item.orders > 0)
    .sort((a, b) => b.share - a.share); // Ensure highest share first

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 mb-6 mt-[-8px]">
      {shares.map(({ app, share }, index) => {
        // Tiered size based on rank (1st–3rd largest get biggest logos, etc.)
        let size;
        if (index < 3) {
          size = 160; // Top 3
        } else if (index < 6) {
          size = 120; // 4th–6th
        } else if (index < 9) {
          size = 80;  // 7th–9th
        } else {
          size = 50;  // 10th or below
        }
        return (
          <img
            key={app}
            src={getLogoFilename(app)}
            alt={`${app} logo`}
            style={{ width: size, height: size }}
            className="object-contain transition-all duration-300 ease-in-out"
            onError={e => { e.target.style.opacity = 0.2; e.target.alt = "Logo not found"; }}
          />
        );
      })}
    </div>
  );
}
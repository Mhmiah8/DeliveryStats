import React, { useState, useEffect } from "react";

export default function CommunityPage() {
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== "undefined" && document.body.classList.contains("darkmode")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.body.classList.contains("darkmode"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={`max-w-xl mx-auto mt-12 p-6 rounded shadow ${
      isDarkMode ? "bg-gray-800" : "bg-white"
    }`}>
      <h1 className={`text-3xl font-bold mb-4 text-center ${
        isDarkMode ? "text-white" : "text-black"
      }`}>
        Tips
      </h1>
      
      {/* Delivery Pro Tips Section */}
      <div className={`mb-6 p-4 rounded-lg ${
        isDarkMode ? "bg-gray-700" : "bg-gray-50"
      }`}>
        <h2 className={`text-xl font-semibold mb-3 text-center ${
          isDarkMode ? "text-white" : "text-black"
        }`}>
          Courier Wisdom
        </h2>
        <ul className="space-y-3">
          {[
            {
              emoji: "🗺️",
              title: "Ditch app navigation",
              text: "Use Google Maps instead. For industrial units/named houses, search the unit number + estate name. Learn local layouts."
            },
            {
              emoji: "🔋",
              title: "Power pack essential",
              text: "Delivery apps drain batteries fast. Even car chargers often can't keep up."
            },
            {
              emoji: "📦",
              title: "Invest in 250L garden sacks",
              text: "Perfect for organizing parcels and protecting your vehicle interior."
            },
            {
              emoji: "🚗",
              title: "Pack smart",
              text: "Load heaviest items first, reverse-pack so deliveries come out in order. Skip oversized parcels that risk vehicle damage."
            },
            {
              emoji: "⏱️",
              title: "Time is money",
              text: "Avoid problematic deliveries (rough roads, distant locations). After 3 failed attempts, return to depot."
            },
            {
              emoji: "👟",
              title: "Waterproof footwear",
              text: "You'll thank yourself during rainy shifts."
            }
          ].map((tip, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2">{tip.emoji}</span>
              <div className={isDarkMode ? "text-gray-200" : "text-gray-800"}>
                <strong>{tip.title}</strong> - {tip.text}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Community Links Section */}
      <div className="mb-6">
        <p className={`mb-4 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
          Connect with fellow couriers to share real-time advice and updates:
        </p>
        <div className="flex flex-col gap-2">
          <a
            href="https://discord.gg/8akQf8KWVs"
            target="_blank"
            rel="noopener noreferrer"
            className={`underline hover:text-blue-400 flex items-center ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            <span className="mr-2">💬</span> Discord Group
          </a>
          <a
            href="https://chat.whatsapp.com/HU1iPKtD0wm1KSLuWVP5m7?mode=ac_t"
            target="_blank"
            rel="noopener noreferrer"
            className={`underline hover:text-green-400 flex items-center ${
              isDarkMode ? "text-green-400" : "text-green-600"
            }`}
          >
            <span className="mr-2">📱</span> WhatsApp Group
          </a>
        </div>
      </div>

      {/* Essential Gear Section */}
      <div className={`p-4 rounded-lg mb-6 ${
        isDarkMode ? "bg-gray-700" : "bg-blue-50"
      }`}>
        <h3 className={`font-semibold mb-2 ${
          isDarkMode ? "text-white" : "text-black"
        }`}>
          Must-Have Gear:
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {["🔦 Torch", "📝 Clipboard", "🖊️ Pens/Markers", "📱 Power Bank", "🧾 Expense Tracker", "🎧 Ear Buds"].map((item, index) => (
            <span key={index} className={`flex items-center ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <img
        src={isDarkMode ? "/DSLogoDark.png" : "/DSLogoLight.png"}
        alt="Delivery Stats Logo"
        className="mx-auto mt-6 max-w-xs"
      />
    </div>
  );
}
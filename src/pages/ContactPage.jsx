import React, { useState, useEffect } from "react";

export default function ContactPage() {
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
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4 text-center">Contact</h1>
      <p className="mb-4">
        For inquiries, please email:{" "}
        <a
          href="mailto:mmiahhilal1@gmail.com"
          className="text-blue-600 underline hover:text-blue-800"
        >
          mmiahhilal1@gmail.com
        </a>
      </p>
      <div className="flex flex-col gap-2">
        <a
          href="https://www.linkedin.com/in/mmiahhilal"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          
        </a>
        <a
          href="https://github.com/mmiahhilal"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          
        </a>
      </div>
      <img
        src={isDarkMode ? "/DSLogoDark.png" : "/DSLogoLight.png"}
        alt="Delivery Stats Logo"
        className="mx-auto mt-12 max-w-xs"
      />
    </div>
  );
}

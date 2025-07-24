import React, { useState, useEffect } from "react";

export default function AboutPage() {
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
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4 text-center">About</h1>
      <p className="mb-4">
        This project aims to provide reliable delivery order data crowdsourced
        from users. Our mission is to empower delivery workers and customers with
        transparent stats.
      </p>
      <p className="mb-4">
        By collecting and sharing real-time and historical data, we help
        London-based couriers make informed decisions about which platforms to
        use, when to work, and how to maximize their earnings.
      </p>
      <p className="mb-4">
        When we don't have enough recent submissions for a particular metric,
        we employ statistically robust estimation methods. Using historical
        trends, platform benchmarks, and industry data patterns, we generate
        reliable approximations to ensure you always have valuable insights
        to inform your decisions.
      </p>
      <p>
        We believe in transparency, community, and supporting the people who keep
        our city moving. Thank you for contributing and making this resource
        better for everyone!
      </p>
      <img
        src={isDarkMode ? "/DSLogoDark.png" : "/DSLogoLight.png"}
        alt="Delivery Stats Logo"
        className="mx-auto mt-12 max-w-xs"
      />
    </div>
  );
}
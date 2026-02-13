import { useState, useEffect } from "react";

export const useCookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const consent = localStorage.getItem("integri-cookie-consent");
    if (consent === null) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("integri-cookie-consent", "accepted");
    setShowBanner(false);
    console.log("Initializing Analytics...");
  };

  const rejectCookies = () => {
    localStorage.setItem("integri-cookie-consent", "rejected");
    setShowBanner(false);
    console.log("Running essential mode only.");
  };

  return {
    showBanner,
    acceptCookies,
    rejectCookies,
  };
};

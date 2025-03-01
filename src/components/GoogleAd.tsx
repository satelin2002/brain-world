"use client";

import { useEffect, useRef } from "react";

interface GoogleAdProps {
  adSlot: string;
  adFormat?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
  className?: string;
}

const getAdSize = (format: GoogleAdProps["adFormat"]) => {
  switch (format) {
    case "horizontal":
      return {
        width: "728px",
        height: "90px",
        mobile: { width: "320px", height: "100px" },
      };
    case "vertical":
      return {
        width: "300px",
        height: "600px",
      };
    case "rectangle":
      return {
        width: "300px",
        height: "250px",
      };
    default:
      return {
        width: "100%",
        height: "auto",
        minHeight: "100px",
      };
  }
};

const GoogleAd: React.FC<GoogleAdProps> = ({
  adSlot,
  adFormat = "auto",
  style = {},
  className = "",
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pushAd = () => {
      try {
        const adsbygoogle = (window as any).adsbygoogle;
        if (adsbygoogle) {
          adsbygoogle.push({});
        }
      } catch (err) {
        console.error("Error loading Google Ad:", err);
      }
    };

    // Check if the container has dimensions before pushing the ad
    if (adRef.current && adRef.current.clientWidth > 0) {
      pushAd();
    } else {
      // If container is not ready, wait a bit and try again
      const timer = setTimeout(pushAd, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const adSize = getAdSize(adFormat);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const adStyle: React.CSSProperties = {
    display: "block",
    textAlign: "center",
    overflow: "hidden",
    width:
      isMobile && adFormat === "horizontal"
        ? adSize.mobile?.width
        : adSize.width,
    height:
      isMobile && adFormat === "horizontal"
        ? adSize.mobile?.height
        : adSize.height,
    minHeight: adSize.minHeight,
    backgroundColor: "#f9fafb", // Light gray background while loading
    ...style,
  };

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="YOUR-ADSENSE-CLIENT-ID"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;

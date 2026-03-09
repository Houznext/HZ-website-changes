import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const GoogleAdSense = () => {
  const adRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            adRef.current &&
            adRef.current.offsetWidth > 0
          ) {
            const adIns = adRef.current.querySelector("ins.adsbygoogle");

            if (
              adIns &&
              !adIns.getAttribute("data-adsbygoogle-status") &&
              typeof window !== "undefined" &&
              Array.isArray(window.adsbygoogle)
            ) {
              try {
                window.adsbygoogle.push({});
              } catch (e) {
                console.error("AdSense Push Error:", e);
              }
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (adRef.current) observer.observe(adRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={adRef}
      className="bg-gray-100 w-full md:min-h-[250px] min-h-[200px] flex items-center justify-center"
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "280px" }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_DATA_ADD_CLIENT}
        data-ad-slot={process.env.NEXT_PUBLIC_GOOGLE_DATA_ADD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAdSense;

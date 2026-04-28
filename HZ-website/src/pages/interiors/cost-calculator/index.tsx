import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoHead from "@/components/SeoHead";
import InteriorCalculator from "@/components/InteriorCalculator";

export default function CostCalculatorPage() {
  return (
    <>
      <SeoHead
        title="Interior Cost Calculator | Houznext"
        description="Get a personalised interior cost estimate in 2 minutes."
        canonical="/interiors/cost-calculator"
      />
      <Navbar />
      <main style={{ background: "#f5f7fa" }}>
        <style>{`
          .hz-proof-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
          }
          .hz-calc-left-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            background:
              linear-gradient(105deg, rgba(15,42,68,0.90) 0%, rgba(15,42,68,0.78) 45%, rgba(15,42,68,0.60) 100%);
          }
          .hz-left-photo {
            position: absolute;
            inset: 0;
            z-index: 0;
            background-size: cover;
            background-position: center;
            transition: transform 8s ease;
          }
          .hz-calc-section:hover .hz-left-photo {
            transform: scale(1.04);
          }
        `}</style>
        <section className="hz-calc-section" style={{ background: "#fff", overflow: "hidden" }}>
          <div className="hz-calc-grid grid grid-cols-1 md:grid-cols-2">
            <div
              className="relative min-h-[400px] sm:min-h-[460px] md:min-h-[400px] overflow-hidden"
              style={{ background: "#0f2a44" }}
            >
              <div
                className="hz-left-photo"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=85)",
                }}
              />
              <div className="hz-calc-left-overlay" />
              <div className="hz-calc-left-inner absolute inset-0 z-[2] flex flex-col justify-start overflow-y-auto py-10 px-5 sm:py-12 sm:px-7 md:justify-center md:overflow-visible md:py-[48px] md:px-[40px]">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#f2994a",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ display: "block", width: 16, height: 2, background: "#f2994a", borderRadius: 1 }} />
                  Cost Calculator
                  <span style={{ display: "block", width: 16, height: 2, background: "#f2994a", borderRadius: 1 }} />
                </div>
                <h2
                  className="font-head font-black text-white mb-3 sm:mb-4 leading-[1.07]"
                  style={{ fontSize: "clamp(26px, 5vw, 54px)", letterSpacing: "-0.5px" }}
                >
                  Know your
                  <br />
                  budget <span style={{ color: "#2f80ed" }}>before</span>
                  <br />
                  you begin.
                </h2>
                <p
                  className="max-w-full md:max-w-[320px] mb-6 sm:mb-7 md:mb-7"
                  style={{ fontSize: "clamp(13px, 2.8vw, 15px)", color: "rgba(255,255,255,0.62)", lineHeight: 1.65 }}
                >
                  Get a personalised interior cost estimate in 2 minutes. No sign-up. No commitment. Just clarity.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="hz-proof-item">
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(47,128,237,0.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s-8-4.5-8-11V5l8-3 8 3v6c0 6.5-8 11-8 11z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Fixed price guarantee</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", marginTop: 1 }}>Quote = final invoice, always</div>
                    </div>
                  </div>
                  <div className="hz-proof-item">
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(242,153,74,0.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f2994a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>45-day avg. delivery</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", marginTop: 1 }}>Fastest in Telangana</div>
                    </div>
                  </div>
                  <div className="hz-proof-item">
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(47,128,237,0.20)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>4.8★ from 680+ homeowners</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", marginTop: 1 }}>Hyderabad, Warangal, Karimnagar</div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  zIndex: 3,
                  background: "linear-gradient(90deg, #2f80ed, #f2994a, #2f80ed)",
                }}
              />
            </div>
            <div
              className="py-8 px-6 md:py-[48px] md:px-[40px]"
              style={{ background: "#f8fafc", display: "flex", flexDirection: "column", justifyContent: "center" }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f2994a", display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <span style={{ display: "block", width: 16, height: 2, background: "#f2994a", borderRadius: 1 }} />
                Your estimate
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0f2a44", lineHeight: 1.15, marginBottom: 6, fontFamily: "inherit" }}>
                How much will your
                <br />
                interiors cost?
              </h2>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 28 }}>
                Personalised estimate in 2 minutes — no sign-up needed
              </p>
              <InteriorCalculator />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

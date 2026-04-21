import { useState } from "react";
import { useRouter } from "next/router";

export default function PortalLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT ||
    "http://localhost:4000/"
  ).replace(/\/?$/, "");

  const sendOtp = async () => {
    if (mobile.length < 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/interiors/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      setOtpSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/interiors/auth/login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: code }),
      });
      if (!res.ok) throw new Error("Invalid or expired OTP");
      const data = (await res.json()) as {
        token: string;
        customer: { id: string };
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("hz_customer_token", data.token);
      }
      const projRes = await fetch(
        `${API}/interiors/customers/${data.customer.id}/projects`,
        {
          headers: { Authorization: `Bearer ${data.token}` },
        },
      );
      const projects = (await projRes.json()) as { id: string }[];
      if (Array.isArray(projects) && projects.length > 0) {
        router.push(`/portal/${projects[0].id}`);
      } else {
        setError("No project found. Please contact your designer.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`);
      if (el) (el as HTMLInputElement).focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-10 w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#1D9E75] flex items-center justify-center text-white text-sm font-semibold">
            HZ
          </div>
          <span className="text-base font-medium text-gray-900">
            Houznext
          </span>
        </div>
        <div className="text-center mb-6">
          <span className="text-xs bg-[#EBF3FF] text-[#1A56DB] px-3 py-1 rounded-full">
            Customer portal
          </span>
          <p className="text-xs text-gray-400 mt-3">
            Sign in to track your home interior project
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {!otpSent ? (
          <>
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Mobile number
            </label>
            <div className="flex gap-2 mb-3">
              <span className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-500 flex-shrink-0">
                +91
              </span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={10}
                placeholder="10-digit number"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#1A56DB] transition-colors"
              />
            </div>
            <div
              className="mb-4 rounded-lg px-3 py-2 text-xs text-[#64748b]"
              style={{
                background: "#f8fafc",
                marginBottom: "14px",
              }}
            >
              Your mobile number is your login ID and is referenced on all Houznext invoices and
              quotations.
            </div>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-[#1A56DB] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1547c0] transition-colors disabled:opacity-60"
            >
              {loading ? "Sending..." : "Continue with OTP"}
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-500 text-center mb-4">
              Enter the 6-digit code sent to +91 {mobile}
            </p>
            <div className="flex gap-2 justify-center mb-5">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-10 h-12 text-center text-lg font-medium border border-gray-200 rounded-lg outline-none focus:border-[#1A56DB] transition-colors"
                />
              ))}
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading || otp.join("").length !== 6}
              className="w-full bg-[#1A56DB] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1547c0] transition-colors disabled:opacity-60 mb-2"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              onClick={() => {
                setOtpSent(false);
                setOtp(["", "", "", "", "", ""]);
              }}
              className="w-full text-xs text-gray-400 hover:text-gray-600 py-1"
            >
              ← Change number
            </button>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          No account? Contact your interior designer
        </p>
      </div>
    </div>
  );
}


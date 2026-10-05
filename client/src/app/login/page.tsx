"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError("Please enter both phone number and password.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token && data.user) {
          login(data.token, data.user);
        }
        router.push("/dashboard");
      } else {
        setError(data.error || data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased selection:bg-primary-container selection:text-surface-container-lowest min-h-screen relative overflow-x-hidden font-body-md text-body-md flex flex-col justify-center">
      
      {/* Subtle Atmospheric Ember Glow Background */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-96 pointer-events-none opacity-30 z-0">
        <div className="w-72 h-72 mx-auto rounded-full blur-[100px] bg-primary-container"></div>
      </div>
      
      <main className="relative z-10 max-w-md mx-auto w-full px-6 py-12 flex flex-col items-center">
        
        {/* Crest & Title */}
        <div className="flex flex-col items-center text-center mb-10 w-full relative">
          <div className="w-16 h-16 rounded-full border border-primary-container/30 bg-surface-container-low flex items-center justify-center glow-inner-subtle relative overflow-hidden mb-5">
            <span className="font-display-lg text-[20px] font-extrabold tracking-tight text-primary-container z-10">AM</span>
          </div>
          
          <h1 className="font-headline-lg text-[26px] font-bold tracking-tight mb-2 uppercase">
            Athlete Login
          </h1>
          <p className="font-label-md text-label-md tracking-wider text-outline uppercase max-w-[280px]">
            Authenticate to access your vault
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full bg-surface-container-low/50 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-xl mb-6">
          
          {error && (
            <div className="w-full bg-error/10 border border-error/20 text-on-error rounded-xl p-3 mb-6 font-label-md text-label-md text-center flex items-center justify-center gap-2">
              <span>{error}</span>
            </div>
          )}

          <form className="w-full space-y-5" onSubmit={handleSubmit}>
            <div className="w-full flex flex-col gap-2 text-left">
              <label className="font-label-caps text-label-caps text-outline tracking-wider" htmlFor="phone">
                MOBILE NUMBER
              </label>
              <input 
                id="phone" 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 99999 99999"
                className="w-full h-14 px-4 bg-surface-container rounded-xl border border-white/[0.05] focus:border-primary-container text-on-surface font-headline-sm text-[16px] tracking-wide focus:outline-none focus:ring-1 focus:ring-primary-container/50 transition-all placeholder:text-outline-variant" 
              />
            </div>

            <div className="w-full flex flex-col gap-2 text-left">
              <label className="font-label-caps text-label-caps text-outline tracking-wider" htmlFor="password">
                ONE-TIME PASSCODE / PASSWORD
              </label>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter OTP or Password"
                  className="w-full h-14 pl-4 pr-12 bg-surface-container rounded-xl border border-white/[0.05] focus:border-primary-container text-on-surface font-body-lg text-body-lg focus:outline-none focus:ring-1 focus:ring-primary-container/50 transition-all placeholder:text-outline-variant" 
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-sm uppercase tracking-wider font-bold"
                  type="button"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button 
                disabled={loading}
                className="w-full h-14 rounded-full bg-primary-container text-on-primary-container font-headline-sm text-headline-sm font-bold tracking-tight glow-amber-button active:scale-[0.98] transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-105" 
                type="submit"
              >
                {loading ? "AUTHENTICATING..." : "LOGIN"}
              </button>
            </div>
          </form>
        </div>

        <p className="font-body-md text-body-md text-outline">
          New to AM-Tippu? 
          <Link className="font-label-lg text-label-lg font-bold text-primary hover:text-primary-container transition-colors ml-2" href="/register">
            Apply Here
          </Link>
        </p>

      </main>
    </div>
  );
}

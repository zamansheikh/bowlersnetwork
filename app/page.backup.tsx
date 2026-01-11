'use client';

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: '' });

  // Handle sending OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('verify');
        // Show snackbar notification that auto-dismisses
        setSnackbar({
          show: true,
          message: data.message || 'Verification code sent to your email! Please check your inbox.',
        });
        // Auto-dismiss after 2 seconds
        setTimeout(() => {
          setSnackbar({ show: false, message: '' });
        }, 2000);
      } else if (data.error && data.error.includes('already verified')) {
        // Email is already verified, proceed directly to registration
        try {
          const registerResponse = await fetch('/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
            }),
          });

          const registerData = await registerResponse.json();

          if (registerResponse.ok) {
            // Show snackbar notification that auto-dismisses
            setSnackbar({
              show: true,
              message: registerData.message || 'Registration successful! We will be in touch soon.',
            });
            // Auto-dismiss after 2 seconds
            setTimeout(() => {
              setSnackbar({ show: false, message: '' });
            }, 2000);
            // Reset form
            setFormData({ firstName: '', lastName: '', email: '' });
            setVerificationCode('');
            setStep('form');
          } else {
            // Display exact error from backend (handle nested error structure)
            const errorMessage = registerData.details?.error || registerData.error || registerData.message || 'Registration failed. Please try again.';
            setSubmitStatus({
              type: 'error',
              message: errorMessage,
            });
          }
        } catch (error) {
          setSubmitStatus({
            type: 'error',
            message: 'Network error during registration. Please try again.',
          });
          console.error('Registration error:', error);
        }
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Failed to send verification code.',
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.',
      });
      console.error('Send OTP error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle verifying OTP and final submission
  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Step 1: Verify OTP
      const verifyResponse = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.success) {
        setSubmitStatus({
          type: 'error',
          message: verifyData.message || 'Invalid verification code.',
        });
        setIsSubmitting(false);
        return;
      }

      // Step 2: If verified, submit registration
      const registerResponse = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        // Show snackbar notification that auto-dismisses
        setSnackbar({
          show: true,
          message: registerData.message || 'Registration successful! We will be in touch soon.',
        });
        // Auto-dismiss after 2 seconds
        setTimeout(() => {
          setSnackbar({ show: false, message: '' });
        }, 2000);
        // Reset form
        setFormData({ firstName: '', lastName: '', email: '' });
        setVerificationCode('');
        setStep('form');
      } else {
        // Display exact error from backend (handle nested error structure)
        const errorMessage = registerData.details?.error || registerData.error || registerData.message || 'Registration failed. Please try again.';
        setSubmitStatus({
          type: 'error',
          message: errorMessage,
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error during registration. Please try again.',
      });
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle going back to form
  const handleBackToForm = () => {
    setStep('form');
    setVerificationCode('');
    setSubmitStatus({ type: null, message: '' });
  };

  const scrollToForm = () => {
    document.getElementById('preRegForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  const testimonials = [
    {
      name: "Norm Duke",
      image: "/images/players/Norm_Duke.jpg",
      quote: "I've been around this game a long time, and I've seen a lot of ideas come and go. But this? This is different. BowlersNetwork has the potential to unite the sport in a way we've never seen, not just for pros, but for everyone who loves the game."
    },
    {
      name: "Chuck Gardner",
      image: "/images/players/Chuck_Gardner.jpg",
      quote: "I've dedicated my life to helping bowlers and growing this sport, and I truly believe BowlersNetwork is the tool we've all been waiting for. It brings everything together, players, fans, centers, brands, and gives bowling the kind of exposure it deserves."
    },
    {
      name: "Parker Bohn III",
      image: "/images/players/parker_bohn.jpg",
      quote: "This sport has been my passion for decades, and when I saw what BowlersNetwork was building, I knew I had to be part of it. This is about more than tournaments or content, it's about creating something meaningful for the entire bowling community."
    },
    {
      name: "Carolyn Dorin-Ballard",
      image: "/images/players/Carolyn_Dorin_Ballard.jpg",
      quote: "For years we've needed a centralized place that brings the bowling world together. When I saw what BowlersNetwork was becoming, I knew this was the right step forward, for players, organizers, and fans alike."
    },
    {
      name: "Liz Johnson",
      image: "/images/players/Liz_Johnson.png",
      quote: "What excites me about BowlersNetwork is that it finally gives our sport the spotlight it deserves, and not just for the pros. It's going to elevate tournaments, promote the people behind the scenes, and connect bowlers at every level."
    }
  ];

  const features = [
    {
      title: "For Bowlers",
      description: "Track your scores, connect with friends, join leagues, and showcase your achievements in one seamless platform designed for every bowler."
    },
    {
      title: "For Centers",
      description: "Engage your customers, manage events, and grow your business with tools that bring your center into the digital age."
    },
    {
      title: "For Leagues & Associations",
      description: "Simplify league management, scheduling, and communication while building a stronger, more connected community."
    },
    {
      title: "For Fans",
      description: "Follow your favorite bowlers, watch live events, and stay updated with the latest news and highlights from the world of bowling."
    },
    {
      title: "For the Future",
      description: "Experience innovation that unites the entire bowling ecosystem, paving the way for the next generation of the sport."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f7fff9] font-['Montserrat',Arial,sans-serif]">
      {/* Header Section */}
      <div className="relative w-full min-h-[420px] bg-gradient-to-br from-[rgba(91,192,84,0.95)] to-[#43a047] flex items-center justify-center overflow-hidden">
        {/* Geometric SVG Background */}
        <svg className="absolute top-0 left-0 w-full h-full z-0" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon fill="#43a047" fillOpacity="0.18" points="0,160 480,80 960,240 1440,120 1440,320 0,320" />
          <polygon fill="#fff" fillOpacity="0.08" points="0,240 600,160 1200,320 1440,200 1440,320 0,320" />
        </svg>

        {/* Header Content */}
        <div className="relative z-10 text-center text-white px-4 py-10">
          <div className="mb-5 flex justify-center">
            <div className="relative w-[170px] h-[170px]">
              <Image
                src="/images/bn_logo_big.png"
                alt="BowlersNetwork Logo"
                width={170}
                height={170}
                className="rounded-full border-4 border-white shadow-[0_2px_12px_rgba(91,192,84,0.18)] bg-white"
                style={{
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }}
              />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-wider mb-3 text-white" style={{ textShadow: '0 2px 16px rgba(67,160,71,0.18)' }}>
            Your Game. Your Network.
          </h1>
          <p className="text-xl text-[#eafff2] mb-5">
            A revolutionary platform for bowling is almost here.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1000px] mx-auto -mt-[60px] bg-white rounded-[22px] shadow-[0_8px_32px_rgba(91,192,84,0.18)] px-8 py-10 relative text-center text-[#4a5b4e]">
        {/* NOTE: Pre-registration is currently disabled */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
          <p className="text-yellow-800 font-semibold">⚠️ Pre-registration is currently offline</p>
          <p className="text-yellow-700 text-sm">We&apos;re working on improvements. Please check back soon!</p>
        </div>

        <p className="text-lg mb-6 leading-relaxed">
          Pre-register today to be among the first to experience the most connected platform the sport has ever seen — and become eligible for our exclusive beta testing group.
        </p>

        <button
          onClick={scrollToForm}
          className="bg-[rgba(91,192,84,0.95)] text-white font-bold border-none rounded-lg px-9 py-4 text-lg cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(91,192,84,0.18)] hover:bg-[#43a047] hover:shadow-[0_4px_16px_rgba(91,192,84,0.28)] hover:-translate-y-0.5"
        >
          Pre-register Now
        </button>

        {/* Testimonials Section */}
        <div className="mt-10 mb-6 bg-gradient-to-br from-[#f7fff9] to-[#eafff2] rounded-[18px] shadow-[0_2px_12px_rgba(91,192,84,0.08)] px-4 py-8">
          <h2 className="mb-4 text-[rgba(91,192,84,0.95)] text-2xl font-bold">What Bowlers Are Saying</h2>
          <div className="flex flex-wrap justify-center gap-5">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl px-5 py-6 max-w-[300px] min-w-[220px] text-[#222] shadow-[0_2px_16px_rgba(91,192,84,0.10)] border-2 border-[rgba(91,192,84,0.10)] opacity-90 transition-all duration-[400ms] hover:opacity-100 hover:-translate-y-2 hover:scale-105"
              >
                <div className="relative w-[56px] h-[56px] mx-auto mb-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    className="rounded-full border-[2.5px] border-[rgba(91,192,84,0.35)]"
                    style={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
                <div className="text-sm mb-3 leading-relaxed">{testimonial.quote}</div>
                <div className="font-bold mt-2 text-[#5bc054]">{testimonial.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="my-10">
          <div className="flex flex-wrap justify-center gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-[20px] shadow-[0_8px_32px_rgba(91,192,84,0.13),0_1.5px_8px_rgba(67,160,71,0.07)] px-7 py-9 min-w-[240px] max-w-[320px] flex-1 flex flex-col items-center transition-all duration-[320ms] border-[2.5px] border-[rgba(91,192,84,0.10)] hover:-translate-y-3.5 hover:scale-[1.045] hover:rotate-[-1.5deg] hover:shadow-[0_12px_40px_rgba(91,192,84,0.22),0_2px_12px_rgba(67,160,71,0.13)] hover:bg-[#f7fff9]"
              >
                <h3 className="text-xl font-black text-[#43a047] mb-3 text-center tracking-wide">
                  {feature.title}
                </h3>
                <div className="text-base text-[#222] text-center leading-relaxed">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-registration Form */}
        <form
          id="preRegForm"
          onSubmit={step === 'form' ? handleSendOTP : handleVerifyAndSubmit}
          className="bg-[rgba(255,255,255,0.85)] rounded-[22px] shadow-[0_8px_32px_rgba(91,192,84,0.13),0_1.5px_8px_rgba(67,160,71,0.07)] px-6 py-10 max-w-[900px] mx-auto mt-9 mb-9 border-[2.5px] border-[rgba(91,192,84,0.10)]"
          style={{ backdropFilter: 'blur(6px)' }}
        >
          <h3 className="text-2xl font-bold text-[#43a047] mb-6 text-center">
            {step === 'form' ? 'Pre-register Now' : 'Verify Your Email'}
          </h3>

          {step === 'form' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border-2 border-[rgba(91,192,84,0.18)] text-base bg-[rgba(255,255,255,0.7)] text-[#222] shadow-[0_1.5px_8px_rgba(91,192,84,0.07)] transition-all duration-200 focus:outline-none focus:border-[#5bc054] focus:shadow-[0_0_0_0.22rem_rgba(91,192,84,0.18),0_2px_16px_rgba(91,192,84,0.10)] focus:bg-[rgba(255,255,255,0.95)]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border-2 border-[rgba(91,192,84,0.18)] text-base bg-[rgba(255,255,255,0.7)] text-[#222] shadow-[0_1.5px_8px_rgba(91,192,84,0.07)] transition-all duration-200 focus:outline-none focus:border-[#5bc054] focus:shadow-[0_0_0_0.22rem_rgba(91,192,84,0.18),0_2px_16px_rgba(91,192,84,0.10)] focus:bg-[rgba(255,255,255,0.95)]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border-2 border-[rgba(91,192,84,0.18)] text-base bg-[rgba(255,255,255,0.7)] text-[#222] shadow-[0_1.5px_8px_rgba(91,192,84,0.07)] transition-all duration-200 focus:outline-none focus:border-[#5bc054] focus:shadow-[0_0_0_0.22rem_rgba(91,192,84,0.18),0_2px_16px_rgba(91,192,84,0.10)] focus:bg-[rgba(255,255,255,0.95)]"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="text-[#222] mb-4">
                  We&apos;ve sent a verification code to <strong>{formData.email}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="text-[#43a047] underline text-sm hover:text-[#5bc054]"
                >
                  Change email
                </button>
              </div>
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  name="verificationCode"
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 rounded-xl border-2 border-[rgba(91,192,84,0.18)] text-base bg-[rgba(255,255,255,0.7)] text-[#222] text-center text-2xl tracking-widest shadow-[0_1.5px_8px_rgba(91,192,84,0.07)] transition-all duration-200 focus:outline-none focus:border-[#5bc054] focus:shadow-[0_0_0_0.22rem_rgba(91,192,84,0.18),0_2px_16px_rgba(91,192,84,0.10)] focus:bg-[rgba(255,255,255,0.95)]"
                />
              </div>
            </>
          )}

          {/* Status Message - Only for errors */}
          {submitStatus.type === 'error' && submitStatus.message && (
            <div className="mb-4 p-4 rounded-lg text-center font-semibold bg-red-100 text-red-800 border-2 border-red-300">
              {submitStatus.message}
            </div>
          )}

          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-[40%] bg-gradient-to-r from-[rgba(91,192,84,0.95)] to-[#43a047] text-white font-black border-none rounded-[10px] px-6 py-4 text-lg shadow-[0_4px_16px_rgba(91,192,84,0.18)] transition-all duration-200 ${isSubmitting
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:bg-gradient-to-r hover:from-[#43a047] hover:to-[rgba(91,192,84,0.95)] hover:shadow-[0_8px_32px_rgba(91,192,84,0.22)] hover:-translate-y-0.5 hover:scale-[1.03]'
                }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {step === 'form' ? 'Sending...' : 'Verifying...'}
                </span>
              ) : (
                step === 'form' ? 'Send Verification Code' : 'Verify & Complete Registration'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Snackbar Notification */}
      {snackbar.show && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#43a047] text-white px-6 py-4 rounded-lg shadow-[0_4px_16px_rgba(67,160,71,0.3)] flex items-center gap-3 animate-pulse z-50">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{snackbar.message}</span>
        </div>
      )}
    </div>
  );
}


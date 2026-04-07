import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignIn, SignUp } from '@clerk/clerk-react';
import Logo from '../components/Logo';
import { Footer } from '../components/ui/footer';

export default function Authentication() {
  const [formState, setFormState] = React.useState(0); // 0 = Sign In, 1 = Sign Up

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      {/* Background Gradients - same as landing page */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
      </div>

      {/* Logo Above Form - Mobile Optimized */}
      <div className="flex justify-center pt-6 sm:pt-8 pb-3 sm:pb-4 relative z-20 px-4">
        <Logo size="md" clickable={true} className="sm:hidden" />
        <Logo size="lg" clickable={true} className="hidden sm:block" />
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 relative z-10 safe-area-inset">
        {/* Main Card */}
        <motion.div
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-surface/30 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Left Panel - Illustration */}
          <div className="hidden md:flex flex-col justify-center p-12 relative bg-black border-r border-white/5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <img src="/images/isometric_auth_security.png" alt="Secure Digital Vault" className="w-full max-w-sm h-auto mb-8 drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500" />
              <h2 className="text-3xl font-black mb-3 font-sans tracking-tight">
                Secure Access <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Portal</span>
              </h2>
              <p className="text-sm text-gray-400 font-mono leading-relaxed mb-6">
                Authenticate your credentials to access encrypted communication channels and enterprise workflows.
              </p>
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 shadow-[0_0_10px_rgba(255,255,255,0.02)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                End-to-End Encryption Active
              </div>
            </motion.div>
          </div>


          {/* Right Panel - Form (Clerk UI) */}
          <div className="p-5 sm:p-8 md:p-12 flex flex-col justify-center items-center bg-black/20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={formState}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col items-center"
                >
                  {formState === 0 ? (
                    <SignIn 
                      routing="path" 
                      path="/auth"
                      fallbackRedirectUrl="/home"
                      appearance={{ elements: { footerAction: { display: "none" } } }}
                    />
                  ) : (
                    <SignUp 
                      routing="path" 
                      path="/auth"
                      fallbackRedirectUrl="/home"
                      appearance={{ elements: { footerAction: { display: "none" } } }}
                    />
                  )}

                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                      {formState === 0 ? "Don't have an account? " : "Already have an account? "}
                      <button
                        onClick={() => setFormState(formState === 0 ? 1 : 0)}
                        className="text-primary hover:text-blue-400 font-semibold transition-colors focus:outline-none"
                      >
                        {formState === 0 ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

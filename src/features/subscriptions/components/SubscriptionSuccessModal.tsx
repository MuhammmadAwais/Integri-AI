import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../hooks/useRedux";
import { clearSubscriptionMessages } from "../slices/subscriptionSlice";
import Portal from "../../../Components/ui/Portal";
import { cn } from "../../../lib/utils";
import { useNavigate } from "react-router-dom";

const SubscriptionSuccessModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { successMessage } = useAppSelector((state: any) => state.subscription);
  const { isDark } = useAppSelector((state: any) => state.theme);

  const navigate = useNavigate();

  const handleClose = () => {
    dispatch(clearSubscriptionMessages());
    navigate("/");
  };

  return (
    <Portal>
      <AnimatePresence>
        {successMessage && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
            {/* Backdrop with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "relative w-full max-w-md overflow-hidden rounded-3xl p-1 shadow-2xl",
                isDark ? "bg-linear-to-br from-gray-800 to-black" : "bg-white"
              )}
            >
              {/* Animated Border/Glow Effect */}
              <div className="absolute inset-0 bg-linear-to-r from-[#00A9A4] via-purple-500 to-[#00A9A4] opacity-20 animate-spin-slow" />

              <div
                className={cn(
                  "relative z-10 flex flex-col items-center p-8 rounded-[22px]",
                  isDark ? "bg-[#121212]" : "bg-white"
                )}
              >
                {/* Close Button */}
                <button
                  title="cross"
                  onClick={handleClose}
                  className={cn(
                    "hover:cursor-pointer absolute top-4 right-4 p-2 rounded-full transition-colors",
                    isDark
                      ? "hover:bg-white/10 text-gray-400"
                      : "hover:bg-gray-100 text-gray-500"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Icon Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="mb-6 relative"
                >
                  <div className="absolute inset-0 bg-zinc-400 blur-xl opacity-40 rounded-full" />
                  <div className="w-20 h-20 bg-linear-to-tr from-zinc-800 to-zinc-400 rounded-full flex items-center justify-center shadow-lg relative z-10">
                    <Check className="w-10 h-10 text-white" strokeWidth={3} />
                  </div>

                  {/* Floating Particles */}
                  <motion.div
                    animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                </motion.div>

                {/* Text Content */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={cn(
                    "text-2xl font-bold text-center mb-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Purchase Successful!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={cn(
                    "text-center mb-8",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {successMessage ||
                    "Your subscription has been upgraded. Enjoy your new features!"}
                </motion.p>

                {/* Action Button */}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClose}
                  className=" w-full py-3.5 rounded-xl bg-linear-to-r from-zinc-600 to-zinc-800 text-white font-semibold shadow-lg shadow-teal-500/20 hover:cursor-pointer"
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default SubscriptionSuccessModal;

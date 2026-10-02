/**
 * LimitToast — lightweight helper functions for showing limit notifications.
 * Uses react-toastify under the hood for consistency with the rest of the app.
 * Import and call these where needed instead of creating a separate component.
 */
import { toast } from "react-toastify";

interface LimitReachedOptions {
  feature: string;
  limit: number;
  resetTime: string | null;
}

interface RemainingOptions {
  feature: string;
  remaining: number;
  unit?: string;
}

/** Toast shown when a hard limit is reached */
export const showLimitReachedToast = ({ feature, limit, resetTime }: LimitReachedOptions) => {
  const message = resetTime
    ? `Limit of ${limit} ${feature} reached. Resets at ${resetTime}.`
    : `Limit of ${limit} ${feature} reached. Upgrade to continue.`;

  toast.warn(message, {
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    toastId: `limit-${feature}`, // Prevent duplicate toasts
    style: {
      background: "#18161C",
      border: "1px solid #3f3f46",
      color: "#fafafa",
      fontSize: "13px",
      fontFamily: "inherit",
    },
  });
};

/** Toast shown after a successful action with remaining count */
export const showRemainingToast = ({ feature, remaining, unit = "" }: RemainingOptions) => {
  if (remaining <= 0) return; // Edge case: already handled by showLimitReachedToast

  const message =
    remaining === 1
      ? `1 ${feature}${unit} remaining today.`
      : `${remaining} ${feature}${unit} remaining today.`;

  toast.info(message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    toastId: `remaining-${feature}`,
    style: {
      background: "#18161C",
      border: "1px solid #3f3f46",
      color: "#a1a1aa",
      fontSize: "13px",
      fontFamily: "inherit",
    },
  });
};

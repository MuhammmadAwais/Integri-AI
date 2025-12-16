import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Render into document.body to break out of any parent stacking contexts
  return mounted ? createPortal(children, document.body) : null;
};

export default Portal;

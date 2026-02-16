import { useState, useEffect } from "react";
import { useAppSelector } from "../../../hooks/useRedux";
import { useAdBlockDetector } from "./useAdBlockDetector";

/**
 * Custom hook that manages AdBlock detection with conversion optimization:
 * - Only shows for logged-in users
 * - Only shows on 3rd+ visit
 * - Uses localStorage for visit tracking (uid-specific)
 * - Uses sessionStorage to prevent double-counting in same session
 */
export const useAdBlockLogic = () => {
  const user = useAppSelector((state: any) => state.auth.user);
  const { isBlocked: adBlockDetected, isDetecting } = useAdBlockDetector();
  
  const [shouldShowAdBlock, setShouldShowAdBlock] = useState(false);
  const [visitCount, setVisitCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Early exit: If user is not logged in, don't show AdBlock modal
    if (!user || !user.id) {
      setShouldShowAdBlock(false);
      setVisitCount(0);
      setIsInitialized(true);
      return;
    }

    const uid = user.id;
    const visitKey = `integri_visit_count_${uid}`;
    const sessionKey = 'integri_session_counted';

    // Check if this session has already been counted
    const sessionCounted = sessionStorage.getItem(sessionKey);
    
    if (!sessionCounted) {
      // This is a new session - increment visit count
      try {
        const currentCount = parseInt(localStorage.getItem(visitKey) || '0', 10);
        const newCount = currentCount + 1;
        
        localStorage.setItem(visitKey, newCount.toString());
        sessionStorage.setItem(sessionKey, 'true');
        setVisitCount(newCount);
        
        // Only show AdBlock modal if visit count > 2 (3rd visit or greater)
        // AND adblock is detected AND not currently detecting
        if (newCount > 2 && adBlockDetected && !isDetecting) {
          setShouldShowAdBlock(true);
        } else {
          setShouldShowAdBlock(false);
        }
      } catch (error) {
        console.error('Error tracking visit count:', error);
        setShouldShowAdBlock(false);
        setVisitCount(0);
      }
    } else {
      // Session already counted - just read the current count
      try {
        const currentCount = parseInt(localStorage.getItem(visitKey) || '0', 10);
        setVisitCount(currentCount);
        
        // Only show if visit count > 2 AND adblock is detected AND not currently detecting
        if (currentCount > 2 && adBlockDetected && !isDetecting) {
          setShouldShowAdBlock(true);
        } else {
          setShouldShowAdBlock(false);
        }
      } catch (error) {
        console.error('Error reading visit count:', error);
        setShouldShowAdBlock(false);
        setVisitCount(0);
      }
    }

    setIsInitialized(true);
  }, [user, adBlockDetected, isDetecting]);

  // Prevent flicker: default to false until initialized
  // This ensures we don't show the modal before we know the user's visit count
  if (!isInitialized) {
    return {
      shouldShowAdBlock: false,
      visitCount: 0,
      isDetecting,
      isInitialized: false,
    };
  }

  return {
    shouldShowAdBlock,
    visitCount,
    isDetecting,
    isInitialized: true,
  };
};

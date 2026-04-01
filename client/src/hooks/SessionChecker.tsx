import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authstore";

const SessionChecker = () => {
  const lastCheckTimeRef = useRef<number>(0);
  const location = useLocation();
  const isCheckingRef = useRef<boolean>(false);
  const { checkAuthentication } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const performSessionCheck = async (force = false) => {
      const now = Date.now();

      if (
        !force &&
        (isCheckingRef.current || now - lastCheckTimeRef.current < 1000)
      ) {
        return;
      }

      if (!isMounted || isCheckingRef.current) return;

      isCheckingRef.current = true;
      lastCheckTimeRef.current = now;

      try {
        await checkAuthentication();
      } catch (error) {
        console.log("Session check failed:", error);
      } finally {
        if (isMounted) {
          isCheckingRef.current = false;
        }
      }
    };

    //  Force check after OAuth success route
    if (location.pathname.includes("oauth-success")) {
      performSessionCheck(true);
    } else {
      performSessionCheck();
    }

    const interval = setInterval(() => performSessionCheck(), 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname, checkAuthentication]);

  return null;
};

export default SessionChecker;
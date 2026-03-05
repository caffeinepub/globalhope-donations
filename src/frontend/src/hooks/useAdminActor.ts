import { useEffect, useRef, useState } from "react";
import { getSecretParameter } from "../utils/urlParams";
import { useActor } from "./useActor";

/**
 * useAdminActor — wraps useActor and calls _initializeAccessControlWithSecret
 * on the anonymous actor whenever the admin has authenticated via email/password.
 *
 * Because this app uses email/password login (not Internet Identity), the actor
 * returned by useActor() is always anonymous — it never triggers the II branch
 * in useActor.ts that sets the admin token. This hook bridges that gap by
 * calling the init method directly on the actor after login.
 */
export function useAdminActor() {
  const { actor, isFetching } = useActor();
  // initKey increments whenever we need to (re-)initialize the admin token.
  // Storing it in state means React will re-render and re-run the init effect.
  const [initKey, setInitKey] = useState(0);
  const initializedForKeyRef = useRef(-1);
  const actorRef = useRef<typeof actor | null>(null);
  const lastSeenInitTsRef = useRef<string | null>(null);

  // Poll localStorage every 500ms for the login signal written by AdminPage.
  // When the signal timestamp changes, bump initKey so the init effect runs.
  useEffect(() => {
    const tick = () => {
      const ts = localStorage.getItem("admin_token_init_needed");
      if (ts && ts !== lastSeenInitTsRef.current) {
        lastSeenInitTsRef.current = ts;
        setInitKey((k) => k + 1);
      }
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []); // runs once; refs are stable

  // Initialize the admin token on the actor whenever:
  //   - a fresh actor object arrives (actor reference changed), or
  //   - initKey bumped (new login signal detected)
  useEffect(() => {
    const isAdminAuthenticated =
      localStorage.getItem("admin_authenticated") === "true";

    // If the actor reference changed, force re-initialization
    if (actor && actorRef.current !== actor) {
      actorRef.current = actor;
      initializedForKeyRef.current = -1; // reset so we run below
    }

    if (!actor) {
      actorRef.current = null;
      initializedForKeyRef.current = -1;
      return;
    }

    // Skip if already initialized for this initKey
    if (initializedForKeyRef.current === initKey) return;
    if (!isAdminAuthenticated) return;

    const adminToken = getSecretParameter("caffeineAdminToken") || "";
    actor
      ._initializeAccessControlWithSecret(adminToken)
      .then(() => {
        initializedForKeyRef.current = initKey;
      })
      .catch(console.error);
  }, [actor, initKey]);

  return { actor, isFetching };
}

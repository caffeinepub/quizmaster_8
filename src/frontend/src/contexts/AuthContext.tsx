import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthContextType {
  isLoggedIn: boolean;
  isInitializing: boolean;
  username: string;
  userRole: UserRole;
  isAdmin: boolean;
  profileLoaded: boolean;
  login: () => void;
  logout: () => void;
  setUsername: (name: string) => void;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    login,
    clear,
    identity,
    isInitializing: iiInitializing,
  } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const [username, setUsernameState] = useState("");
  const [userRole, setUserRole] = useState<UserRole>(UserRole.guest);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const isInitializing = iiInitializing || actorFetching;
  const isAdmin = userRole === UserRole.admin;

  const setUsername = useCallback((name: string) => {
    setUsernameState(name);
  }, []);

  const refreshRole = useCallback(async () => {
    if (!actor || !isLoggedIn) return;
    try {
      const role = await actor.getCallerUserRole();
      setUserRole(role);
    } catch {
      // ignore
    }
  }, [actor, isLoggedIn]);

  useEffect(() => {
    if (!actor || !isLoggedIn) {
      setProfileLoaded(false);
      setUsernameState("");
      setUserRole(UserRole.guest);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [profile, role] = await Promise.all([
          actor.getCallerUserProfile(),
          actor.getCallerUserRole(),
        ]);
        if (cancelled) return;
        if (profile) setUsernameState(profile.name);
        setUserRole(role);
        setProfileLoaded(true);
      } catch {
        if (!cancelled) setProfileLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [actor, isLoggedIn]);

  const logout = useCallback(() => {
    setUsernameState("");
    setUserRole(UserRole.guest);
    setProfileLoaded(false);
    clear();
  }, [clear]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isInitializing,
        username,
        userRole,
        isAdmin,
        profileLoaded,
        login,
        logout,
        setUsername,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

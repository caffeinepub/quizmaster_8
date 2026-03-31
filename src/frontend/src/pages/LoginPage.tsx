import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Brain, Loader2, Sparkles, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const {
    isLoggedIn,
    profileLoaded,
    username,
    setUsername: setAuthUsername,
    refreshRole,
  } = useAuth();

  const [step, setStep] = useState<"welcome" | "setup">("welcome");
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // If already logged in with a profile, redirect to dashboard
  useEffect(() => {
    if (isLoggedIn && profileLoaded && username) {
      navigate({ to: "/dashboard" });
    } else if (isLoggedIn && profileLoaded && !username) {
      setStep("setup");
    }
  }, [isLoggedIn, profileLoaded, username, navigate]);

  const handleSaveProfile = async () => {
    const name = nameInput.trim();
    if (!name) {
      setError("Please enter your name.");
      return;
    }
    if (!actor) return;
    setSaving(true);
    setError("");
    try {
      await actor.saveCallerUserProfile({ name });
      await actor.seedSampleData();
      setAuthUsername(name);
      await refreshRole();
      navigate({ to: "/dashboard" });
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isActorReady = !!actor && !actorFetching;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: "oklch(0.82 0.110 200)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-8"
          style={{ background: "oklch(0.67 0.15 264)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-cyan-glow"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.110 200), oklch(0.75 0.120 195))",
            }}
          >
            <Brain
              className="w-8 h-8"
              style={{ color: "oklch(0.09 0.038 264)" }}
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            QuizMaster
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Test your knowledge. Challenge yourself.
          </p>
        </div>

        {/* Card */}
        <div className="quiz-card rounded-2xl p-8">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  Welcome back
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Sign in with your Internet Identity to continue
                </p>
              </div>

              <Button
                onClick={login}
                disabled={isLoggingIn || !isActorReady}
                className="w-full btn-cyan h-12 text-sm rounded-xl"
                data-ocid="login.primary_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Login with Internet Identity
                  </>
                )}
              </Button>

              {isLoginError && (
                <p
                  className="text-destructive text-sm text-center"
                  data-ocid="login.error_state"
                >
                  {loginError?.message || "Login failed. Please try again."}
                </p>
              )}

              <div className="text-center">
                <p className="text-muted-foreground text-xs">
                  New users will be prompted to set up a profile after signing
                  in.
                </p>
              </div>
            </motion.div>
          )}

          {step === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: "oklch(0.82 0.110 200 / 0.15)" }}
                >
                  <User
                    className="w-6 h-6"
                    style={{ color: "oklch(0.82 0.110 200)" }}
                  />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Set up your profile
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Choose a display name to get started
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground/80 text-sm">
                  Display Name
                </Label>
                <Input
                  id="name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                  placeholder="Enter your name"
                  className="h-11 bg-accent/50 border-white/10 text-foreground placeholder:text-muted-foreground"
                  data-ocid="login.name_input"
                />
                {error && (
                  <p
                    className="text-destructive text-xs"
                    data-ocid="login.name_error"
                  >
                    {error}
                  </p>
                )}
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={saving || !nameInput.trim()}
                className="w-full btn-cyan h-12 text-sm rounded-xl"
                data-ocid="login.save_profile_button"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Start Quizzing →"
                )}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground/60 text-xs mt-8">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, LogIn, Sparkles } from "lucide-react";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL || "https://auth.kimi.com";
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Transfer.app</CardTitle>
          <p className="text-sm text-gray-500 mt-2">UK Property Transactions</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <a href="/api/demo-login" className="block">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Try Demo (No Sign-up)
            </Button>
          </a>
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign in with Kimi
          </Button>
          <p className="text-xs text-gray-400 text-center mt-4">
            Demo mode creates a temporary account for testing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

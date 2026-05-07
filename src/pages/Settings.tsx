import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Bell, Shield, Moon } from "lucide-react";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSave = () => toast.success("Settings saved");

  if (!isAuthenticated) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4"><Shield className="w-8 h-8 text-gray-500" /></div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 max-w-md mb-6">Sign in to access your account settings.</p>
      <a href={`/api/oauth/authorize?client_id=${import.meta.env.VITE_APP_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/oauth/callback`)}&response_type=code&scope=profile&state=${btoa(`${window.location.origin}/api/oauth/callback`)}`}><Button className="bg-emerald-600 hover:bg-emerald-700">Sign in</Button></a>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Settings</h1><p className="text-gray-500 mt-1">Manage your account and preferences</p></div>
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5 text-emerald-600" />Profile</CardTitle><CardDescription>Your personal information</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="name">Name</Label><Input id="name" defaultValue={user?.name || ""} placeholder="Your name" /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" defaultValue={user?.email || ""} placeholder="your@email.com" /></div>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5 text-emerald-600" />Notifications</CardTitle><CardDescription>Configure how you receive updates</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="font-medium">Push Notifications</p><p className="text-sm text-gray-500">Receive in-app notifications</p></div><Switch checked={notifications} onCheckedChange={setNotifications} /></div>
          <Separator />
          <div className="flex items-center justify-between"><div><p className="font-medium">Email Notifications</p><p className="text-sm text-gray-500">Receive updates via email</p></div><Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} /></div>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save Preferences</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Moon className="w-5 h-5 text-emerald-600" />Appearance</CardTitle><CardDescription>Customise the look and feel</CardDescription></CardHeader>
        <CardContent><div className="flex items-center justify-between"><div><p className="font-medium">Dark Mode</p><p className="text-sm text-gray-500">Enable dark theme</p></div><Switch checked={darkMode} onCheckedChange={setDarkMode} /></div></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-600" />Security</CardTitle><CardDescription>Manage your account security</CardDescription></CardHeader>
        <CardContent><div className="flex items-center justify-between"><div><p className="font-medium">Role</p><p className="text-sm text-gray-500 capitalize">{user?.role || "User"}</p></div></div></CardContent>
      </Card>
    </div>
  );
}

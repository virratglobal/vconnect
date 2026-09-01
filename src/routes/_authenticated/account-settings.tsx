import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Lock, Bell, Shield, UserCheck, Eye, EyeOff, AlertTriangle } from "lucide-react";

export const deleteUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Fetch user's organizations where they are the owner
    const { data: ownedMemberships, error: memErr } = await supabaseAdmin
      .from("tenant_members")
      .select("tenant_id")
      .eq("user_id", userId)
      .eq("role", "owner");
    if (memErr) throw memErr;

    // 2. If they are the sole owner of any organization, check if there are other members
    for (const m of ownedMemberships ?? []) {
      const { data: owners } = await supabaseAdmin
        .from("tenant_members")
        .select("user_id")
        .eq("tenant_id", m.tenant_id)
        .eq("role", "owner");

      if (owners && owners.length === 1) {
        const { data: tenant } = await supabaseAdmin
          .from("tenants")
          .select("name")
          .eq("id", m.tenant_id)
          .single();
        throw new Error(
          `Cannot delete account: You are the sole owner of "${tenant?.name || "Workspace"}". Please transfer ownership or delete that organization first.`
        );
      }
    }

    // 3. Delete user via admin client
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return { success: true };
  });

export const Route = createFileRoute("/_authenticated/account-settings")({
  head: () => ({ meta: [{ title: "Account Settings · Virrat Reach" }] }),
  component: AccountSettingsPage,
});

function AccountSettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("recovery") === "true") {
        setActiveTab("security");
        toast.info("Successfully signed in via password recovery link. Please update your password below.", {
          duration: 8000,
        });
      }
    }
  }, []);

  // Profile form states
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Security form states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Preferences states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  // Query my profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      if (error) throw error;

      // Seed form values once loaded
      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      }
      return data;
    },
  });

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setUpdatingProfile(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      await qc.invalidateQueries({ queryKey: ["my-profile", user.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Manage your personal profile, security preferences, and account credentials.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-10 w-[300px] bg-muted rounded animate-pulse" />
          <Card className="animate-pulse border-border/50">
            <CardHeader className="space-y-2">
              <div className="h-5 w-1/3 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </CardHeader>
            <CardContent className="h-40 bg-muted/20" />
          </Card>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-xl w-full sm:w-auto flex overflow-x-auto">
            <TabsTrigger value="profile" className="rounded-lg gap-2 text-sm">
              <User className="size-4" /> Profile Details
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg gap-2 text-sm">
              <Lock className="size-4" /> Password & Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg gap-2 text-sm">
              <Bell className="size-4" /> Notification Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Details Tab */}
          <TabsContent value="profile" className="space-y-6 outline-none">
            <form onSubmit={handleUpdateProfile}>
              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Profile Information</CardTitle>
                  <CardDescription>Update your display name and profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email address (readonly) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <Input
                      id="profile-email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted rounded-xl cursor-not-allowed font-medium"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your login email is managed by your account administrator and cannot be
                      changed here.
                    </p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  {/* Avatar URL */}
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-avatar">Avatar Photo URL</Label>
                    <div className="flex gap-4 items-center">
                      <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar Preview"
                            className="size-full rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          (fullName?.[0] || user?.email?.[0] || "U").toUpperCase()
                        )}
                      </div>
                      <Input
                        id="profile-avatar"
                        placeholder="https://example.com/avatar.jpg"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="rounded-xl flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updatingProfile}
                    className="bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl"
                  >
                    {updatingProfile ? "Saving…" : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 outline-none">
            <form onSubmit={handleUpdatePassword}>
              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Change Password</CardTitle>
                  <CardDescription>
                    Ensure your account is using a secure password to prevent unauthorized access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="rounded-xl pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updatingPassword}
                    className="bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl"
                  >
                    {updatingPassword ? "Updating…" : "Update Password"}
                  </Button>
                </CardFooter>
              </Card>
            </form>

            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden border-warning/20 bg-warning/5">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-warning-foreground">
                  <Shield className="size-5 text-warning" /> Two-Factor Authentication
                </CardTitle>
                <CardDescription>Add an extra layer of security to your account.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-foreground">Authenticator App</div>
                  <p className="text-xs text-muted-foreground">
                    Use an app like Google Authenticator to generate verification codes.
                  </p>
                </div>
                <Switch
                  checked={twoFactor}
                  onCheckedChange={(checked) => {
                    setTwoFactor(checked);
                    toast.info(checked ? "2FA Setup is coming soon." : "2FA disabled.");
                  }}
                />
              </CardContent>
              <CardFooter className="py-2" />
            </Card>

            <DeleteAccountSection />
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6 outline-none">
            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive updates and activity alerts.
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-border/50 space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-foreground">Email Notifications</div>
                    <p className="text-xs text-muted-foreground">
                      Receive critical alerts regarding campaigns, templates, and team invites.
                    </p>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>

                {/* SMS Notifications */}
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-foreground">SMS Notifications</div>
                    <p className="text-xs text-muted-foreground">
                      Get instant text alerts when a campaign is suspended or billing fails.
                    </p>
                  </div>
                  <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>

                {/* Marketing Emails */}
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-foreground">
                      Marketing & Product Updates
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Receive tips, tutorials, and new feature announcements.
                    </p>
                  </div>
                  <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end">
                <Button
                  onClick={() => {
                    toast.success("Preferences saved successfully");
                  }}
                  className="bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl"
                >
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function DeleteAccountSection() {
  const { signOut } = useAuth();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const deleteAccountFn = useServerFn(deleteUserAccount);

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (confirmText !== "DELETE ACCOUNT") {
      toast.error("Please type 'DELETE ACCOUNT' to confirm.");
      return;
    }
    if (
      !confirm(
        "Are you absolutely sure you want to permanently delete your account? This will log you out, delete your profile, and remove you from all organizations. This action is permanent and cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await deleteAccountFn();
      toast.success("Account deleted successfully.");
      await signOut();
      window.location.href = "/auth";
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden border-destructive/20 bg-destructive/5 mt-6">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5 text-destructive animate-pulse" /> Danger Zone: Delete Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated personal data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="confirm-delete-account">
              Type <span className="font-mono bg-destructive/10 px-1.5 py-0.5 rounded text-destructive font-bold text-xs">DELETE ACCOUNT</span> to confirm:
            </Label>
            <Input
              id="confirm-delete-account"
              placeholder="DELETE ACCOUNT"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="rounded-xl border-destructive/20 focus-visible:ring-destructive"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || confirmText !== "DELETE ACCOUNT"}
            variant="destructive"
            className="rounded-xl font-semibold w-full sm:w-auto"
          >
            {loading ? "Deleting Account…" : "Permanently Delete Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="py-2" />
    </Card>
  );
}

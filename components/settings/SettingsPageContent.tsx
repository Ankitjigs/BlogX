"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileEditDialog } from "@/components/settings/ProfileEditDialog";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PublishingSettingsForm } from "@/components/settings/PublishingSettingsForm";
import { Github } from "lucide-react"; // Install icons if missing or use generic
import Image from "next/image";
import LinkedinIcon from "@/components/ui/linkedin-icon";

// Images
import GoogleIconPng from "@/assets/icons/google-app-icon-hd.png";
import GithubIconPng from "@/assets/icons/github-logo-hd.png";
// Using simple hooks if available or fallback.
// Assuming simple-icons are not installed, I will use generic Lucide or texts if specific icons aren't available.
// Actually, let's stick to Lucide placeholders or text if we don't have brand icons, or just use lucide ones if they exist.
// Lucide has Github, Linkedin, Twitter, Mail (for Google?).
// Let's check available icons. Lucide has Github, Twitter (X?), Linkedin. For Google we can use a generic globe or mail.

// Let's assume we can use text or basic icons for now.

interface SettingsRowProps {
  label: string;
  value: string | null | undefined;
  action: React.ReactNode;
}

const SettingsRow = ({ label, value, action }: SettingsRowProps) => (
  <div className="flex items-center justify-between py-6">
    <div className="space-y-1">
      <div className="font-medium text-foreground">{label}</div>
      <div className="text-sm text-muted-foreground max-w-md">{value}</div>
    </div>
    <div>{action}</div>
  </div>
);

const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between py-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-9 w-24" />
    </div>
    <Separator />
    <div className="flex items-center justify-between py-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
    <Separator />
    <div className="py-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
    </div>
  </div>
);

// Define UserSettings type here or import
type UserSettings = {
  allowComments: boolean;
  allowPrivateNotes: boolean;
  allowEmailReplies: boolean;
  replyToEmail: string | null;
  acceptTips: boolean;
};

// Props receive the prisma user settings
interface SettingsPageContentProps {
  userSettings: UserSettings | null;
}

export default function SettingsPageContent({
  userSettings,
}: SettingsPageContentProps) {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Tab State Management
  const currentTab = searchParams.get("tab") || "account";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleDeleteAccount = () => {
    // Open Clerk's modal
    openUserProfile();
  };

  const handleConnect = (
    strategy: "oauth_google" | "oauth_github" | "oauth_linkedin",
  ) => {
    if (!user) return;

    // Clerk's createExternalAccount redirects the user to the provider
    user
      .createExternalAccount({
        strategy: strategy,
        redirectUrl: window.location.href, // Redirect back to this page
      })
      .then((account) => {
        if (account.verification?.externalVerificationRedirectURL) {
          window.location.href =
            account.verification.externalVerificationRedirectURL.href;
        }
      })
      .catch((err) => {
        console.error("Connection failed:", err);
        // Fallback or error toast could go here
        openUserProfile();
      });
  };

  const isConnected = (provider: string) => {
    // Check for provider and verified status
    return user?.externalAccounts.some(
      (acc) =>
        acc.provider === provider && acc.verification?.status === "verified",
    );
  };

  // Render content
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-sans font-medium tracking-tight text-foreground">
          Settings
        </h1>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
          <TabsTrigger
            value="account"
            className="rounded-none border-b-2 border-transparent data-[state=active]:!border-b-primary !border-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="publishing"
            className="rounded-none border-b-2 border-transparent data-[state=active]:!border-b-primary !border-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground"
          >
            Publishing
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:!border-b-primary !border-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent data-[state=active]:!border-b-primary !border-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground"
          >
            Security and apps
          </TabsTrigger>
        </TabsList>

        <div className="min-h-[50vh]">
          {/* Apply skeleton here if loading, OR inside each content?
              User asked to "reuse skeleton in every tab".
              If !isLoaded, we can't really show much, so showing skeleton INSTEAD of content is safe.
           */}

          <TabsContent value="account" className="mt-8 space-y-6">
            {!isLoaded ? (
              <SettingsSkeleton />
            ) : (
              <section>
                <SettingsRow
                  label="Email address"
                  value={user?.primaryEmailAddress?.emailAddress}
                  action={
                    <span className="text-sm text-muted-foreground">
                      Managed via Clerk
                    </span>
                  }
                />
                <Separator />

                <SettingsRow
                  label="Username and subdomain"
                  value={`@${user?.username || "user"}`}
                  action={
                    <span className="text-sm text-muted-foreground">
                      Not editable
                    </span>
                  }
                />
                <Separator />

                <div className="py-6 flex items-start justify-between group cursor-pointer hover:bg-muted/5 rounded-lg transition-colors px-2 -mx-2">
                  <ProfileEditDialog>
                    <div className="flex-1 flex justify-between w-full items-start">
                      <div className="flex items-center justify-between space-y-4 flex-1">
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            Profile Information
                          </div>
                          <div className="text-sm text-muted-foreground max-w-md">
                            Edit your photo, name, and bio
                          </div>
                        </div>
                        <div className="flex items-center gap-6 pt-2">
                          <div className="space-y-1 text-right">
                            <p className="font-medium">{user?.fullName}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {user?.publicMetadata?.bio as string}
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-muted rounded-full overflow-hidden">
                            <Avatar className="h-full w-full">
                              <AvatarImage src={user?.imageUrl} />
                              <AvatarFallback>
                                {user?.firstName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ProfileEditDialog>
                </div>

                <Separator />

                <SettingsRow
                  label="Profile Design"
                  value="Customize the appearance of your profile."
                  action={
                    <Button
                      variant="ghost"
                      className="text-muted-foreground"
                      disabled
                    >
                      Customization coming soon
                    </Button>
                  }
                />
              </section>
            )}
          </TabsContent>

          <TabsContent value="publishing" className="mt-8">
            {!isLoaded ? (
              <SettingsSkeleton />
            ) : userSettings ? (
              <PublishingSettingsForm initialSettings={userSettings} />
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                {/* Explicit wait for userSettings if loaded user but no settings yet? 
                       Actually if !userSettings but isLoaded user, might be fetching.
                       But userSettings comes from Server Prop. It should be there.
                    */}
                <Skeleton className="h-[400px] w-full" />
                <p className="mt-4">Loading settings...</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="mt-8">
            {!isLoaded ? <SettingsSkeleton /> : <NotificationsTab />}
          </TabsContent>

          <TabsContent value="security" className="mt-8 space-y-6">
            {!isLoaded ? (
              <SettingsSkeleton />
            ) : (
              <>
                <div className="py-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
                    Connected Accounts
                  </h3>

                  <div className="space-y-6">
                    {/* Google */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full overflow-hidden">
                          <Image
                            src={GoogleIconPng}
                            alt="Google"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">Google</div>
                          <div className="text-sm text-muted-foreground">
                            {isConnected("google")
                              ? "Connected"
                              : "Connect your Google account"}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={isConnected("google") ? "outline" : "default"}
                        onClick={() =>
                          isConnected("google")
                            ? null
                            : handleConnect("oauth_google")
                        }
                        disabled={isConnected("google")}
                      >
                        {isConnected("google") ? "Connected" : "Connect"}
                      </Button>
                    </div>

                    {/* GitHub */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full overflow-hidden bg-white border">
                          <Image
                            src={GithubIconPng}
                            alt="GitHub"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover p-0.5"
                          />
                        </div>
                        <div>
                          <div className="font-medium">GitHub</div>
                          <div className="text-sm text-muted-foreground">
                            {isConnected("github")
                              ? "Connected"
                              : "Connect your GitHub account"}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={isConnected("github") ? "outline" : "default"}
                        onClick={() =>
                          isConnected("github")
                            ? null
                            : handleConnect("oauth_github")
                        }
                        disabled={isConnected("github")}
                      >
                        {isConnected("github") ? "Connected" : "Connect"}
                      </Button>
                    </div>

                    {/* LinkedIn */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full overflow-hidden">
                          {/* Use the component. Verify props. */}
                          <LinkedinIcon size={40} className="text-[#0077b5]" />
                        </div>
                        <div>
                          <div className="font-medium">LinkedIn</div>
                          <div className="text-sm text-muted-foreground">
                            {isConnected("linkedin")
                              ? "Connected"
                              : "Connect your LinkedIn account"}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={
                          isConnected("linkedin") ? "outline" : "default"
                        }
                        onClick={() =>
                          isConnected("linkedin")
                            ? null
                            : handleConnect("oauth_linkedin")
                        }
                        disabled={isConnected("linkedin")}
                      >
                        {isConnected("linkedin") ? "Connected" : "Connect"}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <SettingsRow
                  label="Sign out of all other sessions"
                  value="Lost your phone? Left yourself logged in on a public computer?"
                  action={
                    <Button variant="outline" onClick={() => signOut()}>
                      Sign out all
                    </Button>
                  }
                />
                <Separator />

                <SettingsRow
                  label="Download your account data"
                  value="You can ask for a copy of your personal data."
                  action={<Button variant="outline">Download .zip</Button>}
                />
                <Separator />

                <SettingsRow
                  label="Security"
                  value="Manage your password and 2-step verification."
                  action={
                    <Button variant="outline" onClick={() => openUserProfile()}>
                      Manage Security
                    </Button>
                  }
                />
                <Separator />

                <div className="flex items-center justify-between py-6">
                  <div className="space-y-1">
                    <div className="font-medium text-red-600">
                      Delete account
                    </div>
                    <div className="text-sm text-muted-foreground max-w-md">
                      Permanently delete your account and all of your content.
                    </div>
                  </div>
                  <div>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Delete account
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

import { db } from "@/lib/db";
import { getRequiredUser } from "@/lib/auth-utils";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { DeleteAccount } from "@/components/profile/delete-account";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const sessionUser = await getRequiredUser();

  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <ProfileForm name={user.name || ""} email={user.email} />

      <Separator />

      <PasswordForm />

      <Separator />

      <DeleteAccount />
    </div>
  );
}

"use client";

import { useState } from "react";
import { deleteAccount } from "@/actions/profile";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteAccount();
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        {!confirming ? (
          <Button variant="destructive" onClick={() => setConfirming(true)}>
            Delete account
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Yes, delete my account"}
            </Button>
            <Button variant="outline" onClick={() => setConfirming(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

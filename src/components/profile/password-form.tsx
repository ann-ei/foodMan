"use client";

import { useState, useRef } from "react";
import { changePassword } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PasswordForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirm = formData.get("confirm") as string;

    if (newPassword !== confirm) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    const result = await changePassword({
      currentPassword: formData.get("currentPassword") as string,
      newPassword,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      formRef.current?.reset();
    }
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">Password changed</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" name="newPassword" type="password" required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input id="confirm" name="confirm" type="password" required minLength={6} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Changing..." : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

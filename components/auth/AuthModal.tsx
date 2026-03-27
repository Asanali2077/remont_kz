"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, UserRole } from "@/components/auth/AuthProvider";

export function AuthModal({ trigger }: { trigger?: ReactNode }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(false);

  const isValid = email && password && (mode === "login" || (password === confirm && role && name));

  async function submit() {
    if (!isValid || loading) return;
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password, role);
        setOpen(false);
        // Redirect based on role
        if (role === "company") {
          router.push("/company/dashboard");
        }
      } else {
        await register(email, password, role, name, phone);
        setOpen(false);
        // Redirect based on role
        if (role === "company") {
          router.push("/company/dashboard");
        }
      }
    } catch (error) {
      // Error is handled by AuthProvider
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : <Button variant="outline" size="sm">Log In</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Log In" : "Register"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "register" && (
            <>
              <Input
                placeholder="Confirm password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            </Button>
            <Button onClick={submit} disabled={!isValid || loading}>
              {loading ? "Loading..." : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

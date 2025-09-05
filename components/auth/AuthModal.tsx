"use client";

import { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

export function AuthModal({ trigger }: { trigger?: ReactNode }) {
  const { login } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const isValid = email && password && (mode === "login" || password === confirm);

  function submit() {
    if (!isValid) return;
    login(email);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : <Button variant="outline" size="sm">Войти</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "Войти" : "Регистрация"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {mode === "register" && (
            <Input placeholder="Повтор пароля" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          )}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Регистрация" : "У меня есть аккаунт"}</Button>
            <Button onClick={submit} disabled={!isValid}>Продолжить</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



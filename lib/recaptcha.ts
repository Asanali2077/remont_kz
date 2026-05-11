export async function verifyRecaptcha(token: string): Promise<boolean> {
  // Skip verification in development if no secret key configured
  if (!process.env.RECAPTCHA_SECRET_KEY) return true;

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token,
    }),
  });

  const data = (await res.json()) as { success: boolean; score: number };
  return data.success && data.score >= 0.5;
}

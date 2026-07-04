import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { compareOtp } from "@/lib/otp";

const PASSWORD_SALT_ROUNDS = 10;

export async function POST(req: Request) {
  const { email, otp, password } = await req.json();
  if (!email || !otp || !password || password.length < 8) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const record = await prisma.passwordResetOtp.findFirst({
    where: { userId: user.id, verified: true, consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  // Re-check the OTP itself (not just the "verified" flag) before touching the password.
  const isValid = await compareOtp(otp, record.otpHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetOtp.update({ where: { id: record.id }, data: { consumed: true } }),
  ]);

  return NextResponse.json({ message: "Password reset successfully." });
}
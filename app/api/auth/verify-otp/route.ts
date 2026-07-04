import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compareOtp } from "@/lib/otp";

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  if (!email || !otp) {
    return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const record = await prisma.passwordResetOtp.findFirst({
    where: { userId: user.id, consumed: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const isValid = await compareOtp(otp, record.otpHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  await prisma.passwordResetOtp.update({
    where: { id: record.id },
    data: { verified: true },
  });

  return NextResponse.json({ message: "Code verified." });
}
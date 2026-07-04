import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtp, hashOtp, otpExpiryDate } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond with 200 so we don't leak which emails have accounts.
  // Only actually generate + send an OTP if the user exists.
  if (user) {
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    // Invalidate any earlier unconsumed codes for this user, then store the new one.
    await prisma.passwordResetOtp.updateMany({
      where: { userId: user.id, consumed: false },
      data: { consumed: true },
    });

    await prisma.passwordResetOtp.create({
      data: { userId: user.id, otpHash, expiresAt: otpExpiryDate() },
    });

    await sendOtpEmail(user.email, otp);
  }

  return NextResponse.json({ message: "If that email has an account, a code has been sent." });
}
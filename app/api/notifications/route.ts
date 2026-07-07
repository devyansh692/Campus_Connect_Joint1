import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      actor: { select: { name: true, image: true } },
    },
  });

  return NextResponse.json(notifications);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, markAllRead } = await req.json();

  if (markAllRead) {
    await prisma.notification.updateMany({
      where: { recipientId: session.user.id, unread: true },
      data: { unread: false },
    });
    return NextResponse.json({ ok: true });
  }

  if (id) {
    const updated = await prisma.notification.update({
      where: { id },
      data: { unread: false },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Missing id or markAllRead" }, { status: 400 });
}
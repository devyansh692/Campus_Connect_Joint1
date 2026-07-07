import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ...rest stays the same

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, image: true,
      bio: true, course: true, year: true, university: true,
      skills: true, interests: true,
      _count: { select: { posts: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { bio, course, year, skills, interests } = body;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      bio,
      course,
      year,
      skills: typeof skills === "string"
        ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : skills,
      interests: typeof interests === "string"
        ? interests.split(",").map((s: string) => s.trim()).filter(Boolean)
        : interests,
    },
  });

  return NextResponse.json(updated);
}
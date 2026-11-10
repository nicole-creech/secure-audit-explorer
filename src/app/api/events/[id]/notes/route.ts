import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authorize } from "@/lib/authz";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("read");
  if (auth.error) return auth.error;

  const { id } = await params;

  const notes = await prisma.analystNote.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize("investigate");
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await req.json();

  const content =
    typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json(
      { error: "Note content is required." },
      { status: 400 }
    );
  }

  if (content.length > 5000) {
    return NextResponse.json(
      { error: "Note content must be 5,000 characters or fewer." },
      { status: 400 }
    );
  }

  // Attribute the note to the signed-in user so the investigation trail is accurate.
  const author = auth.session.user.name || auth.session.user.email || "Unknown user";

  const note = await prisma.analystNote.create({
    data: {
      eventId: id,
      content,
      author,
    },
  });

  return NextResponse.json(note, { status: 201 });
}
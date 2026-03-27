import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const note = await prisma.analystNote.create({
    data: {
      eventId: id,
      content,
      author: "Analyst",
    },
  });

  return NextResponse.json(note, { status: 201 });
}
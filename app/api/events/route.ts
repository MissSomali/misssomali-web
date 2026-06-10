import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const grandFinale = await prisma.event.findFirst({
      where: {
        isGrandFinale: true,
        isPublished: true,
      },
    });

    return NextResponse.json(grandFinale);
  } catch (error) {
    console.error("Public Grand Finale GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

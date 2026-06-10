import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin, logAdminAction } from "@/lib/admin-auth";
import { ActionType, TargetType } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { searchParams } = new URL(request.url);
    const isGrandFinaleParam = searchParams.get("isGrandFinale");

    if (isGrandFinaleParam === "true") {
      const grandFinale = await prisma.event.findFirst({
        where: { isGrandFinale: true },
      });
      return NextResponse.json(grandFinale || null);
    }

    const events = await prisma.event.findMany({
      where: { isGrandFinale: false },
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Admin Events GET API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const {
      title,
      subtitle,
      description,
      location,
      coverImage,
      eventDate,
      countdownDate,
      featuredContestants,
      ticketLink,
      isGrandFinale,
      isFeatured,
      isPublished,
    } = await request.json();

    if (!title || !description || !location || !eventDate || !coverImage) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (isGrandFinale) {
      const existingGrandFinale = await prisma.event.findFirst({
        where: { isGrandFinale: true },
      });
      if (existingGrandFinale) {
        return NextResponse.json(
          { error: "Grand Finale event already exists. Please edit the existing one." },
          { status: 400 }
        );
      }
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        subtitle: subtitle || null,
        description,
        location,
        coverImage,
        eventDate: new Date(eventDate),
        countdownDate: countdownDate ? new Date(countdownDate) : null,
        featuredContestants: featuredContestants || null,
        ticketLink: ticketLink || null,
        isGrandFinale: isGrandFinale ?? false,
        isFeatured: isFeatured ?? false,
        isPublished: isPublished ?? false,
      },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.publish,
      TargetType.event,
      newEvent.id,
      { title, eventDate, isGrandFinale }
    );

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("Admin Events POST API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const {
      id,
      title,
      subtitle,
      description,
      location,
      coverImage,
      eventDate,
      countdownDate,
      featuredContestants,
      ticketLink,
      isGrandFinale,
      isFeatured,
      isPublished,
    } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // If making this event the grand finale, verify another one doesn't exist
    if (isGrandFinale && !existingEvent.isGrandFinale) {
      const existingGrandFinale = await prisma.event.findFirst({
        where: { isGrandFinale: true },
      });
      if (existingGrandFinale) {
        return NextResponse.json(
          { error: "Another Grand Finale event already exists." },
          { status: 400 }
        );
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingEvent.title,
        subtitle: subtitle !== undefined ? subtitle : existingEvent.subtitle,
        description: description !== undefined ? description : existingEvent.description,
        location: location !== undefined ? location : existingEvent.location,
        coverImage: coverImage !== undefined ? coverImage : existingEvent.coverImage,
        eventDate: eventDate !== undefined ? new Date(eventDate) : existingEvent.eventDate,
        countdownDate: countdownDate !== undefined ? (countdownDate ? new Date(countdownDate) : null) : existingEvent.countdownDate,
        featuredContestants: featuredContestants !== undefined ? featuredContestants : existingEvent.featuredContestants,
        ticketLink: ticketLink !== undefined ? ticketLink : existingEvent.ticketLink,
        isGrandFinale: isGrandFinale !== undefined ? isGrandFinale : existingEvent.isGrandFinale,
        isFeatured: isFeatured !== undefined ? isFeatured : existingEvent.isFeatured,
        isPublished: isPublished !== undefined ? isPublished : existingEvent.isPublished,
      },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.update,
      TargetType.event,
      id,
      { title: updatedEvent.title, eventDate: updatedEvent.eventDate, isGrandFinale: updatedEvent.isGrandFinale }
    );

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Admin Events PUT API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.delete,
      TargetType.event,
      id,
      { title: existingEvent.title, isGrandFinale: existingEvent.isGrandFinale }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Events DELETE API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

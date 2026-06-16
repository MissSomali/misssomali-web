import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NotificationType } from "@prisma/client";
import { sendNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const origin = `${protocol}://${host}`;

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: session.user.id },
      include: {
        application: true,
        photos: true
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Contestant profile not found" }, { status: 404 });
    }

    if (!profile.application) {
      return NextResponse.json({ error: "No active application found" }, { status: 404 });
    }

    if (profile.application.status === "submitted" || profile.application.isSubmitted) {
      return NextResponse.json({ error: "Application is already submitted." }, { status: 400 });
    }

    const app = profile.application;
    const hasPhotos = profile.photos.some(p => p.type === "profile") && profile.photos.some(p => p.type === "full_body");
    
    // Check if required fields and photos are complete
    if (
      !app.fullName || 
      !app.phone || 
      !app.city || 
      !app.country || 
      !app.dateOfBirth || 
      !app.educationLevel || 
      !app.occupation || 
      !app.height || 
      !app.motivationWhy || 
      !hasPhotos
    ) {
      return NextResponse.json(
        { error: "Please fill out all fields and upload the required photos before submitting." },
        { status: 400 }
      );
    }

    // Finalize submission state
    const updated = await prisma.contestantApplication.update({
      where: { id: app.id },
      data: {
        status: "submitted",
        isSubmitted: true
      }
    });

    // Create confirmation in-app notification
    await prisma.notification.create({
      data: {
        userId: profile.id,
        title: "Application Submitted",
        message: "Your application has been successfully received and is now under review.",
        type: NotificationType.SUBMITTED,
        actionUrl: "/portal/status",
        isRead: false
      }
    });

    // Send email notification via Resend
    const recipientEmail = profile.email || session.user.email;
    if (recipientEmail) {
      try {
        await sendNotificationEmail({
          to: recipientEmail,
          subject: "Application Submitted - Miss Somali 2026",
          fullName: profile.fullName || "Contestant",
          title: "Application Received",
          message: `Your application has been successfully received and is now under review. The selection committee will evaluate your application file (App Number: ${app.applicationNumber || "Pending"}) and notify you of the next stages shortly. You can track your status directly in the portal.`,
          buttonText: "Track Status",
          buttonUrl: `${origin}/portal/status`
        });
      } catch (emailErr) {
        console.error("Error sending submission email:", emailErr);
      }
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error("Application submit route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

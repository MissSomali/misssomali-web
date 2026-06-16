import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin, logAdminAction } from "@/lib/admin-auth";
import { ActionType, TargetType, Status, NotificationType } from "@prisma/client";
import { sendNotificationEmail } from "@/lib/email";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { id } = await context.params;

    const application = await prisma.contestantApplication.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            formData: true,
            photos: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Application detail GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { id } = await context.params;
    const { newStatus, notes } = await request.json();

    if (!Object.values(Status).includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const origin = `${protocol}://${host}`;

    // Find the application
    const application = await prisma.contestantApplication.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            formData: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update status
    const updateData: any = { status: newStatus };
    if (newStatus === "pending") {
      updateData.isSubmitted = false;
    }

    const updatedApplication = await prisma.contestantApplication.update({
      where: { id },
      data: updateData,
    });

    // If application is approved/rejected etc., update the formData status as well
    if (application.user.formData) {
      await prisma.applicationFormData.update({
        where: { userId: application.userId },
        data: {
          status: newStatus,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });
    }

    // Map status to action type for logging
    let actionType: ActionType = ActionType.update;
    if (newStatus === Status.approved) {
      actionType = ActionType.approve;
    } else if (newStatus === Status.rejected) {
      actionType = ActionType.reject;
    }

    // Log the action
    await logAdminAction(
      session.user.id,
      actionType,
      TargetType.application,
      id,
      {
        oldStatus: application.status,
        newStatus,
        notes,
      }
    );

    // Map status to notification types and email templates
    let notifType: NotificationType;
    let notifTitle = "";
    let notifMessage = "";
    let actionUrl = "/portal/status";
    let emailSubject = "";
    let emailMessage = "";
    let sendMail = false;

    if (newStatus === Status.shortlisted) {
      notifType = NotificationType.SHORTLISTED;
      notifTitle = "Application Shortlisted";
      notifMessage = notes || "Congratulations. You have been shortlisted for the next stage of Miss Somali 2026.";
      emailSubject = "Congratulations! You have been shortlisted - Miss Somali 2026";
      emailMessage = "Congratulations! We are delighted to inform you that you have been shortlisted for the next stage of Miss Somali 2026. The selection committee reviewed your candidate file and found your profile outstanding. Please access the portal to view details and check schedules.";
      sendMail = true;
    } else if (newStatus === Status.approved) {
      notifType = NotificationType.APPROVED;
      notifTitle = "Application Approved";
      notifMessage = notes || "Your application has been approved. Welcome to Miss Somali 2026.";
      emailSubject = "Welcome to Miss Somali 2026!";
      emailMessage = "Congratulations! Your application has been approved. Welcome to Miss Somali 2026! We are thrilled to officially welcome you as a contestant. Access your portal to review schedules, event details, and guidelines.";
      sendMail = true;
    } else if (newStatus === Status.rejected) {
      notifType = NotificationType.REJECTED;
      notifTitle = "Application Status Update";
      notifMessage = notes || "Thank you for applying to Miss Somali 2026. After careful review, your application was not selected.";
      emailSubject = "Application Status Update - Miss Somali 2026";
      emailMessage = "Thank you for applying to Miss Somali 2026. After careful review, your application was not selected for this year's pageant stage. We received many outstanding submissions and the selection process was extremely competitive. We appreciate your interest, and we wish you the very best in your future leadership goals.";
      sendMail = true;
    } else if (newStatus === Status.pending) {
      notifType = NotificationType.UPDATE_REQUIRED;
      notifTitle = "Application Update Required";
      notifMessage = notes || "Please update your profile photo and phone number.";
      actionUrl = "/portal/application";
      emailSubject = "Action Required: Update your application - Miss Somali 2026";
      emailMessage = "The selection committee has reviewed your application and requests that you make updates before we can proceed. Please log in to your portal and update your fields as soon as possible.";
      sendMail = true;
    } else {
      notifType = NotificationType.ANNOUNCEMENT;
      notifTitle = `Application Status: ${newStatus.toUpperCase()}`;
      notifMessage = notes || `Your application status has been changed to ${newStatus}.`;
    }

    // Create system notification
    await prisma.notification.create({
      data: {
        userId: application.userId,
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        actionUrl,
        isRead: false
      },
    });

    // Send email notification
    const recipientEmail = application.user.email;
    if (sendMail && recipientEmail) {
      try {
        await sendNotificationEmail({
          to: recipientEmail,
          subject: emailSubject,
          fullName: application.user.fullName || "Contestant",
          title: notifTitle,
          message: emailMessage,
          notes: notes || undefined,
          buttonText: newStatus === Status.pending ? "Update Application" : "Go to Portal",
          buttonUrl: `${origin}${actionUrl}`
        });
      } catch (emailErr) {
        console.error("Failed to send status update email:", emailErr);
      }
    }

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error("Application detail PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

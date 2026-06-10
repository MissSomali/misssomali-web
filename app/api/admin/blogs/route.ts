import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin, logAdminAction } from "@/lib/admin-auth";
import { ActionType, TargetType } from "@prisma/client";

export async function GET() {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Admin Blogs GET API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { title, slug, excerpt, content, coverImage, author, status: postStatus } = await request.json();

    if (!title || !slug || !content || !coverImage || !author) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Check slug uniqueness
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      return NextResponse.json({ error: "Blog post with this slug already exists" }, { status: 400 });
    }

    const newBlog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage,
        author,
        status: postStatus || "draft",
        publishedAt: postStatus === "published" ? new Date() : null,
      },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.publish,
      TargetType.media, // since Blog doesn't have a direct target type in schema, media is closest or update
      newBlog.id,
      { title, slug }
    );

    return NextResponse.json(newBlog);
  } catch (error) {
    console.error("Admin Blogs POST API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { id, title, slug, excerpt, content, coverImage, author, status: postStatus } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Blog ID required" }, { status: 400 });
    }

    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Check slug uniqueness if it is changing
    if (slug && slug !== existingBlog.slug) {
      const slugCollision = await prisma.blog.findUnique({
        where: { slug },
      });
      if (slugCollision) {
        return NextResponse.json({ error: "Blog post with this slug already exists" }, { status: 400 });
      }
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingBlog.title,
        slug: slug !== undefined ? slug : existingBlog.slug,
        excerpt: excerpt !== undefined ? excerpt : existingBlog.excerpt,
        content: content !== undefined ? content : existingBlog.content,
        coverImage: coverImage !== undefined ? coverImage : existingBlog.coverImage,
        author: author !== undefined ? author : existingBlog.author,
        status: postStatus !== undefined ? postStatus : existingBlog.status,
        publishedAt: postStatus !== undefined 
          ? (postStatus === "published" && !existingBlog.publishedAt ? new Date() : (postStatus === "draft" ? null : existingBlog.publishedAt))
          : existingBlog.publishedAt,
      },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.update,
      TargetType.media,
      id,
      { title: updatedBlog.title, slug: updatedBlog.slug }
    );

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error("Admin Blogs PUT API error:", error);
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
      return NextResponse.json({ error: "Blog ID required" }, { status: 400 });
    }

    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    await prisma.blog.delete({
      where: { id },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.delete,
      TargetType.media,
      id,
      { title: existingBlog.title }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Blogs DELETE API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

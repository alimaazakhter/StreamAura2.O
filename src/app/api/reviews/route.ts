import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET reviews for a specific movie or show
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get("mediaId");
    const mediaType = searchParams.get("mediaType");

    if (!mediaId || !mediaType) {
      return NextResponse.json(
        { error: "Missing mediaId or mediaType" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        mediaId,
        mediaType,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST a new community review & rating
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "You must be signed in to post a review" },
        { status: 401 }
      );
    }

    const { mediaId, mediaType, content, rating } = await req.json();

    if (!mediaId || !mediaType || !content || !rating) {
      return NextResponse.json(
        { error: "Missing required review fields" },
        { status: 400 }
      );
    }

    const parsedRating = parseInt(rating);
    if (parsedRating < 1 || parsedRating > 10) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 10 stars" },
        { status: 400 }
      );
    }

    const newReview = await prisma.review.create({
      data: {
        mediaId,
        mediaType,
        content,
        rating: parsedRating,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Review posted successfully", review: newReview },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create review error:", error);
    
    // Intercept Prisma foreign key constraint violation (P2003)
    if (error.code === "P2003" || error.message?.includes("foreign key constraint")) {
      return NextResponse.json(
        { error: "Your session is outdated or linked to a non-existent account. Please Sign Out and Sign In again to register a fresh user in Supabase." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to post review" },
      { status: 500 }
    );
  }
}

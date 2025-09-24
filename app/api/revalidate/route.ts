import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * WordPress webhook handler for content revalidation
 * Receives notifications from WordPress when content changes
 * and revalidates the entire site
 */

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`🔄 [${timestamp}] Webhook received from ${request.ip || 'unknown IP'}`);

  try {
    // Log headers for debugging
    console.log('📋 Headers:', {
      'x-webhook-secret': request.headers.get("x-webhook-secret") ? '***SECRET***' : 'MISSING',
      'content-type': request.headers.get("content-type"),
      'user-agent': request.headers.get("user-agent"),
    });

    const requestBody = await request.json();
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    const secret = request.headers.get("x-webhook-secret");
    const expectedSecret = process.env.WORDPRESS_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.error("❌ WORDPRESS_WEBHOOK_SECRET not configured in environment");
      return NextResponse.json(
        { message: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      console.error("❌ Invalid webhook secret provided");
      console.error(`Expected length: ${expectedSecret.length}, Received length: ${secret?.length || 0}`);
      return NextResponse.json(
        { message: "Invalid webhook secret" },
        { status: 401 }
      );
    }

    console.log("✅ Webhook secret validated successfully");

    const { contentType, contentId } = requestBody;

    if (!contentType) {
      return NextResponse.json(
        { message: "Missing content type" },
        { status: 400 }
      );
    }

    try {
      console.log(
        `🚀 Starting revalidation for: ${contentType}${
          contentId ? ` (ID: ${contentId})` : ""
        }`
      );

      const tagsToRevalidate = [];

      // Revalidate specific content type tags
      tagsToRevalidate.push("wordpress");
      revalidateTag("wordpress");

      if (contentType === "post") {
        tagsToRevalidate.push("posts");
        revalidateTag("posts");
        if (contentId) {
          const postTag = `post-${contentId}`;
          tagsToRevalidate.push(postTag);
          revalidateTag(postTag);
        }
        // Clear all post pages when any post changes
        tagsToRevalidate.push("posts-page-1");
        revalidateTag("posts-page-1");
      } else if (contentType === "category") {
        tagsToRevalidate.push("categories");
        revalidateTag("categories");
        if (contentId) {
          const categoryPostsTag = `posts-category-${contentId}`;
          const categoryTag = `category-${contentId}`;
          tagsToRevalidate.push(categoryPostsTag, categoryTag);
          revalidateTag(categoryPostsTag);
          revalidateTag(categoryTag);
        }
      } else if (contentType === "tag") {
        tagsToRevalidate.push("tags");
        revalidateTag("tags");
        if (contentId) {
          const tagPostsTag = `posts-tag-${contentId}`;
          const tagTag = `tag-${contentId}`;
          tagsToRevalidate.push(tagPostsTag, tagTag);
          revalidateTag(tagPostsTag);
          revalidateTag(tagTag);
        }
      } else if (contentType === "author" || contentType === "user") {
        tagsToRevalidate.push("authors");
        revalidateTag("authors");
        if (contentId) {
          const authorPostsTag = `posts-author-${contentId}`;
          const authorTag = `author-${contentId}`;
          tagsToRevalidate.push(authorPostsTag, authorTag);
          revalidateTag(authorPostsTag);
          revalidateTag(authorTag);
        }
      }

      // Also revalidate the entire layout for safety
      revalidatePath("/", "layout");
      console.log("🔄 Revalidated layout path: /");
      console.log("✅ Successfully revalidated tags:", tagsToRevalidate.join(", "));

      return NextResponse.json({
        revalidated: true,
        message: `Revalidated ${contentType}${
          contentId ? ` (ID: ${contentId})` : ""
        } and related content`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error revalidating path:", error);
      return NextResponse.json(
        {
          revalidated: false,
          message: "Failed to revalidate site",
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      {
        message: "Error revalidating content",
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAdminActivity, sendSlackNotification } from "@/lib/integrations";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Query user by reset token and ensure the token hasn't expired yet
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "The password reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token data on Supabase
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Log password update activity
    await logAdminActivity(
      "PASSWORD_RESET_SUCCESS",
      `Password successfully reset for user: ${user.name || "User"} (${user.email})`
    );

    return NextResponse.json(
      { success: true, message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);

    // Log password reset error and alert Slack
    try {
      await logAdminActivity(
        "PASSWORD_RESET_ERROR",
        `Password reset process encountered an error: ${error.message || error}`
      );
      await sendSlackNotification(
        "🔥 Password Reset Completion Failure",
        `*Error:* ${error.message || error}`,
        "#ef4444"
      );
    } catch (logErr) {
      console.error("Failed to audit password reset error:", logErr);
    }

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

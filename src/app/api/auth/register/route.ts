import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAdminActivity, sendSlackNotification } from "@/lib/integrations";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if email already exists in Supabase
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate beautiful default avatar using Dicebear
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    // Create user in Supabase
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        image: avatar,
      },
    });

    // Log new registration to Supabase
    await logAdminActivity(
      "USER_REGISTRATION",
      `New user registered: ${name} (${email.toLowerCase()}) - UserID: ${newUser.id}`
    );

    // Send registration Slack alert
    try {
      await sendSlackNotification(
        "🎉 New User Sign-Up",
        `*Name:* ${name}\n*Email:* ${email.toLowerCase()}`,
        "#10b981", // Success emerald green
        [
          { title: "User Database ID", value: newUser.id },
          { title: "Registration Status", value: "Success" }
        ]
      );
    } catch (slackError) {
      console.error("Failed to send signup notification to Slack:", slackError);
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    // Log registration error and notify Slack
    try {
      const emailAttempt = req.headers.get("x-attempted-email") || "Unknown email";
      await logAdminActivity(
        "REGISTRATION_FAILURE",
        `Registration failure. Error: ${error.message || error}`
      );
      await sendSlackNotification(
        "🔥 User Registration Failure",
        `*Error:* ${error.message || error}`,
        "#ef4444" // Crimson red error
      );
    } catch (logErr) {
      console.error("Failed to audit registration error:", logErr);
    }

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

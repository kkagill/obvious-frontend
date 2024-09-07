import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { recaptchaToken } = await request.json();

    if (!recaptchaToken) {
      return NextResponse.json({ error: "reCAPTCHA token is required" }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY is not set in environment variables.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Prepare the request body for the reCAPTCHA verification
    const formData = new URLSearchParams({
      secret: secretKey,
      response: recaptchaToken,
    });

    // Verify reCAPTCHA via Google's API
    const recaptchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const recaptchaData = await recaptchaResponse.json();

    // Check the response and ensure the score is above a reasonable threshold
    if (recaptchaData.success && recaptchaData.score > 0.5) {
      return NextResponse.json({ success: true, score: recaptchaData.score }, { status: 200 });
    } else {
      console.error("ReCaptcha verification failed:", recaptchaData);
      return NextResponse.json({ success: false, error: "ReCaptcha verification failed" }, { status: 403 });
    }
  } catch (error) {
    console.error("Error during ReCaptcha verification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
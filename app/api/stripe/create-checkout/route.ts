import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { createCheckout } from "@/libs/stripe";
import prisma from "@/libs/prisma";
import config from "@/config";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  } else if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: "Success and cancel URLs are required" },
      { status: 400 }
    );
  } else if (!body.mode) {
    return NextResponse.json(
      {
        error:
          "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
      },
      { status: 400 }
    );
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { priceId, mode, successUrl, cancelUrl } = body;

    const user = await prisma.user.findUnique({
      where: {
        id: session?.user?.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 400 }
      );
    }

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      clientReferenceId: session.user.id,
      user: {
        email: session?.user?.email,
        // If the user has already purchased, it will automatically prefill it's credit card
        customerId: user?.customerId,
      },
      // If you send coupons from the frontend, you can pass it here
      // couponId: body.couponId,
    });

    //const plan = findPlanDetails(body.priceId);

    // const stripeSessionURL = await prisma.$transaction(async (prisma) => {
    //   await prisma.user.update({
    //     where: { id: session.user.id },
    //     data: {
    //       availableCredits: {
    //         increment: plan.credits,
    //       },
    //     },
    //   });

    //   await prisma.creditPurchaseHistory.create({
    //     data: {
    //       userId: session.user.id,
    //       priceId: body.priceId,
    //       credits: plan.credits,
    //       price: plan.price,
    //     },
    //   });

    //   const stripeSessionURL = await createCheckout({
    //     priceId,
    //     mode,
    //     successUrl,
    //     cancelUrl,
    //     // If user is logged in, it will pass the user ID to the Stripe Session so it can be retrieved in the webhook later
    //     clientReferenceId: user?.id,
    //     // If user is logged in, this will automatically prefill Checkout data like email and/or credit card for faster checkout
    //     user,
    //     // If you send coupons from the frontend, you can pass it here
    //     // couponId: body.couponId,
    //   });

    //   return stripeSessionURL;
    // });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
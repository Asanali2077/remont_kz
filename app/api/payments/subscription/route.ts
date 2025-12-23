import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth, requireCompany } from "@/lib/middleware";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const createSubscriptionSchema = z.object({
  plan: z.enum(["free", "basic", "premium", "enterprise"]),
  period: z.enum(["monthly", "quarterly", "semiannual", "yearly"]).optional().default("monthly"),
  autoRenew: z.boolean().default(true),
});

// GET /api/payments/subscription - Get current subscription
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.userId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      // Return free plan as default
      return NextResponse.json({
        plan: "FREE",
        status: "ACTIVE",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        autoRenew: false,
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/payments/subscription - Create/update subscription
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireCompany()(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const body = await request.json();
    const validatedData = createSubscriptionSchema.parse(body);

    // Calculate end date based on period
    const periodMonths: Record<string, number> = {
      monthly: 1,
      quarterly: 3,
      semiannual: 6,
      yearly: 12,
    };

    const months = periodMonths[validatedData.period || "monthly"] || 1;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // Cancel existing active subscriptions
    await prisma.subscription.updateMany({
      where: {
        userId: user.userId,
        status: SubscriptionStatus.ACTIVE,
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
      },
    });

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.userId,
        plan: validatedData.plan.toUpperCase() as SubscriptionPlan,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        autoRenew: validatedData.autoRenew,
      },
    });

    // Create transaction record
    const planPrices: Record<string, number> = {
      free: 0,
      basic: 5000,
      premium: 12000,
      enterprise: 50000,
    };

    const basePrice = planPrices[validatedData.plan] || 0;
    // Apply discounts for longer periods
    const discounts: Record<string, number> = {
      monthly: 0,
      quarterly: 0.1, // 10% discount
      semiannual: 0.15, // 15% discount
      yearly: 0.2, // 20% discount
    };
    const discount = discounts[validatedData.period || "monthly"] || 0;
    const amount = Math.round(basePrice * months * (1 - discount));

    if (amount > 0) {
      await prisma.transaction.create({
        data: {
          userId: user.userId,
          amount,
          currency: "KZT",
          type: "SUBSCRIPTION",
          status: "PENDING",
          description: `Subscription: ${validatedData.plan} (${validatedData.period || "monthly"})`,
        },
      });
    }

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


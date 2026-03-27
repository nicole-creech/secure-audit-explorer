import { NextResponse } from "next/server";
import { getRecentNotifications } from "@/lib/notifications";

export async function GET() {
  try {
    const notifications = await getRecentNotifications(50);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
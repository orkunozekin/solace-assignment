import { NextRequest, NextResponse } from "next/server";
import { advocates } from "@/db/schema";
import { count } from "drizzle-orm";
import db from "@/db";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;

  const data = await db.select().from(advocates).limit(limit).offset(offset);

  const totalRecords = await db.select({ value: count() }).from(advocates);

  console.log("res:", {
    data,
    meta: {
      total: totalRecords[0].value,
      page,
      limit,
    },
  });

  return NextResponse.json({
    data,
    meta: {
      total: totalRecords[0].value,
      page,
      limit,
    },
  });
}

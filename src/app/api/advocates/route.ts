import { NextRequest, NextResponse } from "next/server";
import { advocates } from "@/db/schema";
import { count, or, ilike, sql } from "drizzle-orm";
import db from "@/db";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search");
  const offset = (page - 1) * limit;

  // Build search conditions if search term is provided
  let data, totalRecords;

  if (search && search.trim()) {
    const searchTerm = `%${search.trim().toLowerCase()}%`;

    const searchConditions = or(
      ilike(advocates.firstName, searchTerm),
      ilike(advocates.lastName, searchTerm),
      ilike(advocates.city, searchTerm),
      ilike(advocates.degree, searchTerm),
      sql`${advocates.specialties}::text ILIKE ${searchTerm}`,
      sql`${advocates.yearsOfExperience}::text ILIKE ${searchTerm}`
    );

    // Execute queries with search conditions
    data = await db
      .select()
      .from(advocates)
      .where(searchConditions)
      .limit(limit)
      .offset(offset);

    totalRecords = await db
      .select({ value: count() })
      .from(advocates)
      .where(searchConditions);
  } else {
    // Execute queries without search conditions
    data = await db.select().from(advocates).limit(limit).offset(offset);

    totalRecords = await db.select({ value: count() }).from(advocates);
  }

  return NextResponse.json({
    data,
    meta: {
      total: totalRecords[0].value,
      page,
      limit,
      search: search || null,
    },
  });
}

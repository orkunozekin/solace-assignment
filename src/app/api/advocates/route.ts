import { NextRequest, NextResponse } from "next/server";
import { advocates } from "@/db/schema";
import { count, or, ilike, sql, asc, desc } from "drizzle-orm";
import db from "@/db";

enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder") || SortOrder.ASC;
  const offset = (page - 1) * limit;

  // Build sort condition
  let orderByClause;
  if (sortBy) {
    const sortDirection = sortOrder === SortOrder.DESC ? desc : asc;

    switch (sortBy) {
      case "firstName":
        orderByClause = sortDirection(advocates.firstName);
        break;
      case "lastName":
        orderByClause = sortDirection(advocates.lastName);
        break;
      case "city":
        orderByClause = sortDirection(advocates.city);
        break;
      case "degree":
        orderByClause = sortDirection(advocates.degree);
        break;
      case "yearsOfExperience":
        orderByClause = sortDirection(advocates.yearsOfExperience);
        break;
      default:
        orderByClause = asc(advocates.id); // Default sort
    }
  } else {
    orderByClause = asc(advocates.id); // Default sort by id
  }

  // Build search conditions if search term is provided
  let data, totalRecords;

  if (search && search.trim()) {
    const searchTerm = `%${search.trim().toLowerCase()}%`;

    const searchConditions = or(
      ilike(advocates.firstName, searchTerm),
      ilike(advocates.lastName, searchTerm),
      ilike(advocates.city, searchTerm),
      ilike(advocates.degree, searchTerm),
      // Search in specialties array (JSONB field)
      sql`${advocates.specialties}::text ILIKE ${searchTerm}`,
      // Search in years of experience (convert to text)
      sql`${advocates.yearsOfExperience}::text ILIKE ${searchTerm}`
    );

    // Execute queries with search conditions and sorting
    data = await db
      .select()
      .from(advocates)
      .where(searchConditions)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    totalRecords = await db
      .select({ value: count() })
      .from(advocates)
      .where(searchConditions);
  } else {
    // Execute queries without search conditions but with sorting
    data = await db
      .select()
      .from(advocates)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    totalRecords = await db.select({ value: count() }).from(advocates);
  }

  return NextResponse.json({
    data,
    meta: {
      total: totalRecords[0].value,
      page,
      limit,
      search: search || null,
      sortBy: sortBy || null,
      sortOrder: sortOrder || SortOrder.ASC,
    },
  });
}

import ideas from "@/data/ideas.db.json";
import { rankIdeas } from "@/lib/ideaMatcher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { profile, limit = 10 } = await req.json();
  const recommendations = rankIdeas(ideas as any, profile, limit);
  return NextResponse.json({ recommendations });
}

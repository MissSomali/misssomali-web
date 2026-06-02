import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const handler = auth.handler();

export async function GET(request: NextRequest, context: any) {
  const resolvedParams = await context.params;
  return handler.GET(request, { params: Promise.resolve(resolvedParams) });
}

export async function POST(request: NextRequest, context: any) {
  const resolvedParams = await context.params;
  return handler.POST(request, { params: Promise.resolve(resolvedParams) });
}

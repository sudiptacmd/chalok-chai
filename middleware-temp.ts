import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Temporarily disable all middleware logic to fix redirect loop
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

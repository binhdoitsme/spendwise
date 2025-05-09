import { NextResponse } from "next/server";

// POST /journals/{id}/transactions -- create transaction
export function POST() {
  return NextResponse.json({}, { status: 201 });
}

// DELETE /journals/{id}/transactions -- remove transaction
export function DELETE() {}

import { NextRequest } from "next/server";

// GET /journals/{id}/collaborators -- get all collaborators of this account book
export function GET(request: NextRequest) {}

// POST /journals/{id}/collaborators -- invite collaborators to account book
export function POST(request: NextRequest) {}

// DELETE /journals/{id}/collaborators -- remove collaborators from account book
export function DELETE(request: NextRequest) {}

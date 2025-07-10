import { noContent, ok } from "@/app/api/api-responses";
import { provideSpendingCategoryServices } from "@/modules/spending-categories/spending-category.module";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("POST /api/journals/[id]/categories");
  const journalId = (await params).id;
  const spendingCategoryServices = provideSpendingCategoryServices();
  const { name, limit, currency } = await request.json();
  const result = await spendingCategoryServices.addSpendingCategory(
    journalId,
    name,
    limit,
    currency
  );
  return ok(result);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const journalId = (await params).id;
  const spendingCategoryServices = provideSpendingCategoryServices();
  const result = await spendingCategoryServices.getSpendingCategoriesByJournal(
    journalId
  );
  return ok(result);
}

export async function DELETE(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("categoryId") || "";
  console.log({categoryId})
  const spendingCategoryServices = provideSpendingCategoryServices();
  await spendingCategoryServices.deleteSpendingCategory(categoryId);
  return noContent();
}

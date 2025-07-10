import { SpendingCategoryDto } from "@/modules/shared/application/dto/dtos.types";
import { SpendingCategory } from "../../domain/spending-category";

export function mapToSpendingCategoryDto(
  data: SpendingCategory
): SpendingCategoryDto {
  return {
    id: data.id.value,
    journalId: data.journalId.value,
    name: data.name,
    limit: data.limit,
    type: data.type,
    monthlySpent: Object.fromEntries(data.monthlySpent.entries()),
    createdAt: data.createdAt.toISO()!,
    updatedAt: data.updatedAt.toISO()!,
  };
}

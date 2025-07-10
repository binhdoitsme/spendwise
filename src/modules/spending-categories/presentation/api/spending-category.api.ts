import { ResponseWithData } from "@/app/api/api-responses";
import { ApiClientWrapper } from "@/lib/api-client";
import { SpendingCategoryDto } from "@/modules/shared/application/dto/dtos.types";

export class SpendingCategoryApi extends ApiClientWrapper {
  async createSpendingCategory(
    journalId: string,
    data: {
      name: string;
      limit: number;
      currency: string;
    }
  ) {
    return await this.client
      .post<ResponseWithData<{ id: string }>>(
        `/api/journals/${journalId}/categories`,
        data
      )
      .then((response) => response.data.data);
  }

  async getSpendingCategoriesByJournal(
    journalId: string
  ): Promise<{ spendingCategories: SpendingCategoryDto[] }> {
    return await this.client
      .get<ResponseWithData<{ spendingCategories: SpendingCategoryDto[] }>>(
        `/api/journals/${journalId}/categories`
      )
      .then((response) => response.data.data);
  }

  async deleteSpendingCategory(journalId: string, categoryId: string): Promise<void> {
    return await this.client.delete(
      `/api/journals/${journalId}/categories?categoryId=${categoryId}`
    );
  }
}

import { Language } from "@/components/common/i18n";

export interface SpendingCategoryLabels {
  formTitle: string;
  formFieldName: string;
  formFieldNamePlaceholder: string;
  formFieldAmount: string;
  formFieldAmountPlaceholder: string;
  formSubmit: string;
  actionEdit: string;
  actionDelete: string;
  remaining: string;
}

export const spendingCategoryLabels: Record<Language, SpendingCategoryLabels> =
  {
    en: {
      formTitle: "Add Category",
      formFieldName: "Name",
      formFieldNamePlaceholder: "Category name",
      formFieldAmount: "Limit",
      formFieldAmountPlaceholder: "Amount",
      formSubmit: "Create Category",
      actionEdit: "Edit",
      actionDelete: "Delete",
      remaining: "Remaining",
    },
    vi: {
      formTitle: "Thêm quỹ",
      formFieldName: "Tên quỹ",
      formFieldNamePlaceholder: "Tên quỹ chi tiêu",
      formFieldAmount: "Hạn mức",
      formFieldAmountPlaceholder: "Số tiền",
      formSubmit: "Lưu quỹ",
      actionEdit: "Chỉnh sửa",
      actionDelete: "Xoá",
      remaining: "Còn lại",
    },
  };

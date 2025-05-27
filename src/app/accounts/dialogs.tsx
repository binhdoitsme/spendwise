import { Localizable } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import {
  AccountForm,
  AccountFormValues,
} from "@/modules/accounts/presentation/components/account-form";
import { AccountPageLabels } from "./labels";

export type AccountDialogType =
  | { type: "new" }
  | { type: "view"; account: AccountBasicDto }
  | { type: "edit"; account: AccountBasicDto }
  | { type: "delete"; account: AccountBasicDto }
  | { type: null };

interface AccountDialogContentProps extends Localizable {
  dialogType: AccountDialogType["type"];
  account?: AccountBasicDto;
  onCreate: (values: AccountFormValues) => void | Promise<void>;
  onDelete?: (account: AccountBasicDto) => void | Promise<void>;
  onClose: () => void;
  labels: AccountPageLabels;
}

export function AccountDialogContent({
  dialogType,
  account,
  onCreate,
  onDelete,
  onClose,
  language,
  labels,
}: AccountDialogContentProps) {
  if (dialogType === "new") {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{labels.newAccount}</DialogTitle>
        </DialogHeader>
        <AccountForm
          language={language}
          className="h-full mt-2"
          onSubmit={onCreate}
        />
      </>
    );
  }
  if (dialogType === "view" && account) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{labels.viewAccount}</DialogTitle>
        </DialogHeader>
        <AccountForm
          language={language}
          className="h-full mt-2"
          initialValues={account as unknown as AccountFormValues}
          onSubmit={() => {}}
        />
      </>
    );
  }
  if (dialogType === "edit" && account) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{labels.editAccount}</DialogTitle>
        </DialogHeader>
        <AccountForm
          language={language}
          className="h-full mt-2"
          initialValues={account as unknown as AccountFormValues}
          onSubmit={() => {}}
        />
      </>
    );
  }
  if (dialogType === "delete" && account) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{labels.confirmDeleteAccount}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>{labels.deleteConfirmPrompt}</p>
          <div className="space-x-2">
            <Button onClick={() => onDelete?.(account)}>{labels.yes}</Button>
            <Button variant="secondary" onClick={onClose}>
              {labels.no}
            </Button>
          </div>
        </div>
      </>
    );
  }
  return null;
}

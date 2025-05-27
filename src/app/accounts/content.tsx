"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { AccountApi } from "@/modules/accounts/presentation/api/account.api";
import { AccountFormValues } from "@/modules/accounts/presentation/components/account-form";
import { AccountCard } from "@/modules/accounts/presentation/components/account-item";
import { AccountDialogContent, AccountDialogType } from "./dialogs";
import { accountPageLabels } from "./labels";

import { useI18n } from "@/components/common/i18n";
import {
  deleteAccount,
  editAccount,
  viewAccount,
} from "@/modules/accounts/presentation/components/account-commands";
import { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLoader } from "../loader.context";

export function MyAccountPageContent({
  accounts,
}: {
  accounts: AccountBasicDto[];
}) {
  const [dialog, setDialog] = useState<AccountDialogType>({ type: null });
  const [open, setOpen] = useState(false);
  const api = useMemo(() => new AccountApi(), []);
  const { loadingStart, loadingEnd } = useLoader();
  const { language } = useI18n();
  const labels = accountPageLabels[language];

  const handleDelete = (account: AccountBasicDto) => async () => {
    try {
      await api.deleteAccount(account.id);
      setDialog({ type: null });
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(labels.failedToDelete);
    }
  };

  const handleCreateAccount = async (values: AccountFormValues) => {
    loadingStart();
    try {
      await api.createAccount(values);
      setDialog({ type: null });
      setOpen(false);
    } catch (err) {
      console.error(err);
      const errMessage =
        err instanceof AxiosError
          ? err.response!.data.data.message
          : (err as Error).message;
      toast.error(`${labels.failedToCreate} ${errMessage}`);
    } finally {
      loadingEnd();
    }
  };

  // Dialog open helpers
  const showNewAccountDialog = () => {
    setDialog({ type: "new" });
    setOpen(true);
  };
  const showViewAccountDialog = (account: AccountBasicDto) => {
    setDialog({ type: "view", account });
    setOpen(true);
  };
  const showEditAccountDialog = (account: AccountBasicDto) => {
    setDialog({ type: "edit", account });
    setOpen(true);
  };
  const showConfirmDeleteAccountDialog = (account: AccountBasicDto) => {
    setDialog({ type: "delete", account });
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    // Delay clearing dialog content to avoid abrupt content change
    setTimeout(() => setDialog({ type: null }), 200);
  };

  return (
    <div className="w-full p-6 grid lg:grid-cols-3 grid-cols-2 gap-2">
      <div className="col-span-2 lg:col-span-3 mb-4 flex flex-col gap-4 items-start">
        <h1 className="text-2xl font-bold">{labels.myAccounts}</h1>
        <Button onClick={showNewAccountDialog}>
          <Plus /> {labels.newAccount}
        </Button>
      </div>
      {accounts.map((account) => (
        <AccountCard
          language={language}
          key={account.id}
          className="flex flex-row justify-between"
          account={account}
          commands={[
            viewAccount(language)(showViewAccountDialog),
            editAccount(language)(showEditAccountDialog),
            deleteAccount(language)(showConfirmDeleteAccountDialog),
          ]}
          layout="row"
        />
      ))}
      <Dialog
        open={open}
        onOpenChange={(v) => (v ? setOpen(true) : handleDialogClose())}
      >
        <DialogContent>
          <AccountDialogContent
            dialogType={dialog.type}
            account={"account" in dialog ? dialog.account : undefined}
            onCreate={handleCreateAccount}
            onDelete={
              "account" in dialog ? handleDelete(dialog.account) : undefined
            }
            onClose={handleDialogClose}
            language={language}
            labels={labels}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { AccountApi } from "@/modules/accounts/presentation/api/account.api";
import {
  AccountForm,
  AccountFormValues,
} from "@/modules/accounts/presentation/components/account-form";
import { AccountCard } from "@/modules/accounts/presentation/components/account-item";

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
  const [dialog, setDialog] = useState<{
    title: string;
    content: React.ReactNode;
  }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const api = useMemo(() => new AccountApi(), []);
  const { loadingStart, loadingEnd } = useLoader();

  const handleDelete = (account: AccountBasicDto) => async () => {
    try {
      await api.deleteAccount(account.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account!");
    }
  };

  const handleCreateAccount = async (values: AccountFormValues) => {
    loadingStart();
    try {
      await api.createAccount(values);
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      const errMessage =
        err instanceof AxiosError
          ? err.response!.data.data.message
          : (err as Error).message;
      toast.error(`Failed to create account: ${errMessage}`);
    } finally {
      loadingEnd();
    }
  };

  const handleNewAccountDialog = () => {
    setDialog({
      title: "New Account",
      content: <AccountForm onSubmit={handleCreateAccount} />,
    });
    setDialogOpen(true);
  };

  const handleViewAccountDialog = (account: AccountBasicDto) => {
    setDialog({
      title: "View Account",
      content: (
        <AccountForm
          initialValues={account as unknown as AccountFormValues}
          onSubmit={(account) => alert(JSON.stringify(account))}
        />
      ),
    });
    setDialogOpen(true);
  };

  const handleEditAccountDialog = (account: AccountBasicDto) => {
    setDialog({
      title: "Edit Account",
      content: (
        <AccountForm
          initialValues={account as unknown as AccountFormValues}
          onSubmit={(account) => alert(JSON.stringify(account))}
        />
      ),
    });
    setDialogOpen(true);
  };

  const handleConfirmDeleteAccountDialog = (account: AccountBasicDto) => {
    setDialog({
      title: "Confirm Delete Account",
      content: (
        <div className="space-y-4">
          <p>Are you sure want to delete this account?</p>
          <div className="space-x-2">
            <Button onClick={handleDelete(account)}>Yes</Button>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              No
            </Button>
          </div>
        </div>
      ),
    });
    setDialogOpen(true);
  };

  return (
    <div className="w-full p-6 grid lg:grid-cols-3 grid-cols-2 gap-2">
      <div className="col-span-2 lg:col-span-3 mb-4 flex flex-col gap-4 items-start">
        <h1 className="text-2xl font-bold">My Accounts</h1>
        <Button onClick={handleNewAccountDialog}>
          <Plus /> New Account
        </Button>
      </div>
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          className="flex flex-row justify-between"
          account={account}
          commands={[
            viewAccount((account) => handleViewAccountDialog(account)),
            editAccount((account) => handleEditAccountDialog(account)),
            deleteAccount((account) =>
              handleConfirmDeleteAccountDialog(account)
            ),
          ]}
          layout="row"
        />
      ))}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogTitle>{dialog?.title}</DialogTitle>
          {dialog?.content}
        </DialogContent>
      </Dialog>
    </div>
  );
}

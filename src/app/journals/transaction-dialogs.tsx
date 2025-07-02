import { Language, useI18n } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  JournalUserBasicDto,
  TagDto,
  TransactionDetailedDto,
} from "@/modules/journals/application/dto/dtos.types";
import { TransactionFormSchema } from "@/modules/journals/presentation/components/forms";
import { Color } from "@/modules/journals/presentation/components/tag/tag-colors";
import {
  AccountSelectProps,
  TransactionForm,
} from "@/modules/journals/presentation/components/transaction/transaction-form";
import { AccountSummaryDto } from "@/modules/reports/application/dto/dtos.types";
import { MonthlyUsage } from "@/modules/reports/presentation/components/monthly-usage";
import { PaymentDueRow } from "@/modules/reports/presentation/components/payment-due";
import { JournalDetailsPageLabels } from "./[id]/labels";
import { Skeleton } from "@/components/ui/skeleton";

interface BaseTransactionDialogProps {
  labels: JournalDetailsPageLabels;
  language: Language;
  selectableAccounts: Record<string, AccountSelectProps[]>;
  colorizedTags: (TagDto & { color: Color })[];
  collaborators: JournalUserBasicDto[];
  onNoAccount: () => void;
  onUnknownTag: (tag: string) => Promise<void>;
}

interface NewTransactionDialogProps extends BaseTransactionDialogProps {
  onSubmit: (data: TransactionFormSchema) => Promise<void>;
}

export function NewTransactionDialog({
  labels,
  language,
  selectableAccounts,
  colorizedTags,
  collaborators,
  onSubmit,
  onNoAccount,
  onUnknownTag,
}: NewTransactionDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{labels.newTransaction}</DialogTitle>
      </DialogHeader>
      <Separator />
      <TransactionForm
        language={language}
        accounts={selectableAccounts}
        tags={colorizedTags}
        collaborators={collaborators}
        onSubmit={onSubmit}
        onNoAccount={onNoAccount}
        onUnknownTag={onUnknownTag}
      />
    </>
  );
}

interface ViewTransactionDialogProps extends BaseTransactionDialogProps {
  transaction: TransactionDetailedDto;
}

export function ViewTransactionDialog({
  labels,
  language,
  selectableAccounts,
  colorizedTags,
  collaborators,
  transaction,
  onNoAccount,
  onUnknownTag,
}: ViewTransactionDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{labels.transactionDetails}</DialogTitle>
      </DialogHeader>
      <TransactionForm
        language={language}
        transaction={transaction}
        isReadonly
        accounts={selectableAccounts}
        tags={colorizedTags}
        collaborators={collaborators}
        onNoAccount={onNoAccount}
        onUnknownTag={onUnknownTag}
        onSubmit={() => Promise.resolve()} // Placeholder since form is readonly
      />
    </>
  );
}

interface EditTransactionDialogProps extends NewTransactionDialogProps {
  transaction: TransactionDetailedDto;
}

export function EditTransactionDialog({
  labels,
  language,
  selectableAccounts,
  colorizedTags,
  collaborators,
  transaction,
  onSubmit,
  onNoAccount,
  onUnknownTag,
}: EditTransactionDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{labels.editTransaction}</DialogTitle>
      </DialogHeader>
      <TransactionForm
        language={language}
        transaction={transaction}
        accounts={selectableAccounts}
        tags={colorizedTags}
        collaborators={collaborators}
        onSubmit={onSubmit}
        onNoAccount={onNoAccount}
        onUnknownTag={onUnknownTag}
      />
    </>
  );
}

interface DuplicateTransactionDialogProps extends NewTransactionDialogProps {
  transaction: TransactionDetailedDto;
}

export function DuplicateTransactionDialog({
  labels,
  language,
  selectableAccounts,
  colorizedTags,
  collaborators,
  transaction,
  onSubmit,
  onNoAccount,
  onUnknownTag,
}: DuplicateTransactionDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{labels.duplicateTransaction}</DialogTitle>
      </DialogHeader>
      <TransactionForm
        language={language}
        transaction={{ ...transaction, id: undefined }}
        accounts={selectableAccounts}
        tags={colorizedTags}
        collaborators={collaborators}
        onSubmit={onSubmit}
        onNoAccount={onNoAccount}
        onUnknownTag={onUnknownTag}
      />
    </>
  );
}

interface DeleteTransactionDialogProps {
  labels: JournalDetailsPageLabels;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteTransactionDialog({
  labels,
  onDelete,
  onCancel,
}: DeleteTransactionDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{labels.confirmDelete}</DialogTitle>
      </DialogHeader>
      <p>{labels.confirmDeletePrompt}</p>
      <div className="space-x-2">
        <Button variant="destructive" onClick={onDelete}>
          {labels.confirmDeleteYes}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          {labels.cancel}
        </Button>
      </div>
    </>
  );
}

interface ViewAccountReportDialogProps {
  labels: JournalDetailsPageLabels;
  accountReports?: AccountSummaryDto;
}

export function ViewAccountReportDialog({
  labels,
  accountReports,
}: ViewAccountReportDialogProps) {
  const { language } = useI18n();

  return (
    <>
      <DialogHeader>
        <DialogTitle>{labels.accountSummary}</DialogTitle>
      </DialogHeader>
      <div />
      <div className="space-y-3">
        {!accountReports && <Skeleton className="h-[4rem] w-full rounded-xl" />}
        {!!accountReports?.upcomingDues?.length && (
          <>
            <h2 className="text-lg font-semibold">{labels.dueSoon}</h2>
            <div>
              {accountReports.upcomingDues.map((due, index) => (
                <PaymentDueRow key={index} item={due} language={language} />
              ))}
            </div>
            <Separator />
          </>
        )}
        {!!accountReports?.monthlySpends?.length && (
          <>
            <h2 className="text-lg font-semibold">{labels.history}</h2>
            <div className="space-y-4">
              {accountReports.monthlySpends.map((spend, index) => (
                <MonthlyUsage
                  key={index}
                  item={spend}
                  language={language}
                  orientation="month"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export type TransactionDialogType =
  | "new"
  | "view"
  | "edit"
  | "duplicate"
  | "delete"
  | "accountReport";

type TransactionDialogContentProps = {
  dialogType: TransactionDialogType;
} & NewTransactionDialogProps &
  Partial<{
    transaction: TransactionDetailedDto;
  }> &
  DeleteTransactionDialogProps &
  ViewAccountReportDialogProps;

export function TransactionDialogContent({
  dialogType,
  ...props
}: TransactionDialogContentProps) {
  switch (dialogType) {
    case "new":
      return <NewTransactionDialog {...(props as NewTransactionDialogProps)} />;
    case "view":
      return (
        <ViewTransactionDialog {...(props as ViewTransactionDialogProps)} />
      );
    case "edit":
      return (
        <EditTransactionDialog {...(props as EditTransactionDialogProps)} />
      );
    case "duplicate":
      return (
        <DuplicateTransactionDialog
          {...(props as DuplicateTransactionDialogProps)}
        />
      );
    case "delete":
      return (
        <DeleteTransactionDialog
          labels={props.labels}
          onDelete={props.onDelete}
          onCancel={props.onCancel}
        />
      );
    case "accountReport":
      return <ViewAccountReportDialog {...props} />;
    default:
      return null;
  }
}

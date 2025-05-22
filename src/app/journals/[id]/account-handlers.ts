import { useLoader } from "@/app/loader.context";
import { AccountBasicDto } from "@/modules/accounts/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { extractErrorMessage } from "@/modules/shared/presentation/errors";
import { toast } from "sonner";

export function useAccountTabHandlers({
  journalApi,
  journalId,
  setOpen,
  handleRefreshJournal,
}: {
  journalApi: JournalApi;
  journalId: string;
  setOpen: (value: boolean) => void;
  handleRefreshJournal: () => void | Promise<void>;
}) {
  const { loadingStart, loadingEnd } = useLoader();

  const handleUnlinkAccount = async (account: AccountBasicDto) => {
    loadingStart();
    try {
      await journalApi.unlinkAccount(journalId, account.id);
      toast.success("Successfully unlinked account from journal!");
      await handleRefreshJournal();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(
        `Could not unlink selected account: ${extractErrorMessage(err)}`
      );
    } finally {
      loadingEnd();
    }
  };

  return {
    handleUnlinkAccount,
  };
}

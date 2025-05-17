"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { JournalFormSchema } from "@/modules/journals/presentation/components/forms";
import { JournalForm } from "@/modules/journals/presentation/components/journal/journal-form";
import { JournalList } from "@/modules/journals/presentation/components/journal/journal-list";
import { useJournalListContext } from "@/modules/journals/presentation/contexts/journal-list.context";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useLoader } from "../loader.context";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function JournalListPage() {
  const authContext = useAuthContext();
  const journalListContext = useJournalListContext();
  const [open, setOpen] = useState(false);
  const { loadingStart, loadingEnd, isLoading } = useLoader();

  const api = new JournalApi();
  const handleCreateJournal = async (f: JournalFormSchema) => {
    loadingStart();
    try {
      const response = await api.createJournal(f);
      toast.info("Successfully created journal!");
      journalListContext.setJournals([
        ...journalListContext.journals,
        response.data,
      ]);
      setOpen(false);
    } catch (err) {
      toast.error((err as AxiosError).message);
    } finally {
      loadingEnd();
    }
  };
  return (
    <div className="p-6 space-y-6 w-full max-w-[1000px] max-h-screen mx-auto">
      <h1 className="text-2xl font-bold">My Finance Journals</h1>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="md:w-auton">
            <Plus />
            New Finance Journal
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>New Finance Journal</DialogTitle>
          <div>
            <JournalForm onSubmit={handleCreateJournal} isLoading={isLoading} />
          </div>
        </DialogContent>
      </Dialog>
      <JournalList
        journals={journalListContext.journals}
        currentUserEmail={authContext.user?.email}
      />
    </div>
  );
}

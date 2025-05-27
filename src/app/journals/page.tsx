"use client";
import { useI18n } from "@/components/common/i18n";
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
import { AxiosError } from "axios";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLoader } from "../loader.context";
import { journalListLabels } from "./labels";

export default function JournalListPage() {
  const authContext = useAuthContext();
  const journalListContext = useJournalListContext();
  const { language } = useI18n();
  const labels = journalListLabels[language];
  const { loadingStart, loadingEnd, isLoading } = useLoader();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log(labels.title);
    if (mounted) {
      document.title = labels.title;
    }
  }, [labels, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 w-full max-w-[1000px] max-h-screen mx-auto">
      <h1 className="text-2xl font-bold">{labels.pageTitle}</h1>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="md:w-auton">
            <Plus />
            {labels.newJournal}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{labels.newJournal}</DialogTitle>
          <div>
            <JournalForm
              language={language}
              onSubmit={handleCreateJournal}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </Dialog>
      <JournalList
        language={language}
        journals={journalListContext.journals}
        currentUserEmail={authContext.user?.email}
      />
    </div>
  );
}

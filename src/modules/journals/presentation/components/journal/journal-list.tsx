"use client";
import { Localizable } from "@/components/common/i18n";
import { JournalBasicDto } from "@/modules/journals/application/dto/dtos.types";
import { useRouter } from "next/navigation";
import { JournalItem } from "./journal-item";
import { journalLabels } from "./labels";

type JournalListProps = {
  journals: JournalBasicDto[];
  currentUserEmail?: string;
} & Localizable;

export function JournalList({
  journals,
  currentUserEmail,
  language,
}: JournalListProps) {
  const router = useRouter();
  const labels = journalLabels[language];

  return (
    <div className="grid grid-cols-2 gap-4">
      {journals.length === 0 ? (
        <p className="opacity-50 col-span-2">{labels.noJournals}</p>
      ) : (
        journals.map((journal) => (
          <JournalItem
            language={language}
            key={journal.id}
            journal={journal}
            onClick={() => {
              router.push(`/journals/${journal.id}`);
            }}
            currentUserEmail={currentUserEmail}
          />
        ))
      )}
    </div>
  );
}

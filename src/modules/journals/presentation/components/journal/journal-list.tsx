"use client";
import { JournalBasicDto } from "@/modules/journals/application/dto/dtos.types";
import { Localizable } from "@/modules/shared/presentation/types";
import { useRouter } from "next/navigation";
import { JournalItem } from "./journal-item";

type JournalListProps = {
  journals: JournalBasicDto[];
  currentUserEmail?: string;
} & Localizable;

export function JournalList({ journals, currentUserEmail }: JournalListProps) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 gap-4">
      {journals.length === 0 ? (
        <p className="opacity-50 col-span-2">
          No journals found. Start tracking your financial journey today!
        </p>
      ) : (
        journals.map((journal) => (
          <JournalItem
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

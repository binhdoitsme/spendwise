import { Localizable } from "@/components/common/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalBasicDto } from "@/modules/journals/application/dto/dtos.types";
import { journalLabels } from "./labels";

type JournalItemProps = {
  journal: JournalBasicDto;
  currentUserEmail?: string;
  onClick?: () => void | Promise<void>;
} & Localizable;

export function JournalItem({
  journal,
  currentUserEmail,
  language,
  onClick,
}: JournalItemProps) {
  const isCurrentUserOwner = journal.ownerEmail === currentUserEmail;
  const labels = journalLabels[language];

  return (
    <Card
      className="transition-all duration-300 hover:bg-secondary cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{journal.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          {labels.owner}: {isCurrentUserOwner ? labels.you : journal.ownerEmail}
        </p>
        <p>
          {labels.createdAt}: {journal.createdAt}
        </p>
      </CardContent>
    </Card>
  );
}

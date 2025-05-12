import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalBasicDto } from "@/modules/journals/application/dto/dtos.types";
import { Localizable } from "@/modules/shared/presentation/types";

type JournalItemProps = {
  journal: JournalBasicDto;
  currentUserEmail?: string;
  onClick?: () => void | Promise<void>;
} & Localizable;

export function JournalItem({
  journal,
  currentUserEmail,
  onClick,
}: JournalItemProps) {
  const isCurrentUserOwner = journal.ownerEmail === currentUserEmail;

  return (
    <Card
      className="transition-all duration-300 hover:bg-secondary cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>{journal.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Owner: {isCurrentUserOwner ? "you" : journal.ownerEmail}</p>
        <p>Created at: {journal.createdAt}</p>
      </CardContent>
    </Card>
  );
}

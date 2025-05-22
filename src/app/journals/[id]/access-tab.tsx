import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import {
  JournalDetailedDto,
  JournalUserBasicDto,
} from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { Trash, UserPlus2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AccessDialogContent, AccessDialogType } from "./access-dialogs";

export interface AccessTabProps {
  journal: JournalDetailedDto;
  api: JournalApi;
  handleRefreshJournal: () => void | Promise<void>;
}

export function AccessTab({
  journal,
  handleRefreshJournal,
  api,
}: AccessTabProps) {
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<AccessDialogType | null>(null);
  const authContext = useAuthContext();
  const [selectedSharedUser, setSelectedSharedUser] =
    useState<JournalUserBasicDto>();

  // Combine dialog open logic into one effect
  useEffect(() => {
    if (selectedSharedUser) {
      setDialogType("removeAccess");
      setOpen(true);
    } else if (dialogType) {
      setOpen(true);
    }
  }, [selectedSharedUser, dialogType]);

  // Reset dialog state when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setDialogType(null);
        setSelectedSharedUser(undefined);
      }, 100);
    }
  }, [open]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Users with Access</h2>
        <Button variant="secondary" onClick={() => setDialogType("invite")}>
          <UserPlus2 />
          Invite to Workspace
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <AccessDialogContent
            api={api}
            handleRefreshJournal={handleRefreshJournal}
            journal={journal}
            setOpen={setOpen}
            user={selectedSharedUser}
            dialogType={dialogType}
          />
        </DialogContent>
      </Dialog>
      <div className="mb-4 overflow-scroll h-48">
        <ul className="mt-2 space-yl-2">
          {journal.collaborators.map((user, index) => (
            <li key={index} className="flex justify-between text-sm py-1">
              <span>
                {user.user.firstName} {user.user.lastName} ({user.user.email})
              </span>
              <div className="flex gap-3 items-center">
                <span className="text-gray-500">{user.permission}</span>
                <Button
                  variant="ghost"
                  disabled={
                    user.permission === "owner" ||
                    user.user.email === authContext.user?.email
                  }
                  onClick={() => setSelectedSharedUser(user.user)}
                >
                  <Trash className="w-5 text-destructive cursor-pointer" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

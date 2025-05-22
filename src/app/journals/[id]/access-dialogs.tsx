import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  JournalDetailedDto,
  JournalUserBasicDto,
} from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export interface AccessDialogContentProps {
  user?: JournalUserBasicDto;
  journal: JournalDetailedDto;
  api: JournalApi;
  setOpen: (value: boolean) => void;
  handleRefreshJournal: () => void | Promise<void>;
}

function RemoveAccessConfirmationDialog(props: AccessDialogContentProps) {
  const { setOpen, journal, api } = props;
  const user = props.user!;
  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await api.removeCollaborator({ journalId: journal.id, userId });
      setOpen(false);
    } catch (error) {
      console.log("Error removing collaborator", error);
      toast.error("Failed to remove collaborator. Please try again.");
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirm deletion</DialogTitle>
      </DialogHeader>
      <Card className="border-none shadow-none py-0">
        <CardContent className="p-0 pt-4">
          <p>
            Are you sure want to remove{" "}
            <strong className="font-bold">
              {user.firstName} {user.lastName} ({user.email})
            </strong>{" "}
            as a collaborator?
          </p>
        </CardContent>
        <CardFooter className="w-full flex gap-2 px-0">
          <Button
            variant="destructive"
            onClick={() => handleRemoveCollaborator(user.id)}
          >
            Yes
          </Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            No
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  accessType: z.enum(["read", "write"]),
});

export type InviteFormSchema = z.infer<typeof inviteSchema>;

function InviteDialog({
  api,
  journal,
  handleRefreshJournal,
  setOpen,
}: AccessDialogContentProps) {
  const inviteForm = useForm<InviteFormSchema>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      accessType: "write",
    },
  });

  const handleInviteCollaborator = async (data: InviteFormSchema) => {
    // Handle the form submission logic here
    try {
      await api.inviteCollaborator({
        journalId: journal.id,
        email: data.email,
        permission: data.accessType,
      });
      await handleRefreshJournal();
      inviteForm.reset();
      toast.success("Collaborator invited successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      // Handle error (e.g., show a notification)
      toast.error("Failed to invite collaborator. Please try again.");
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Share with others</DialogTitle>
      </DialogHeader>
      <Card className="border-none shadow-none py-0">
        <CardContent className="p-0 pt-4">
          <Form {...inviteForm}>
            <form
              onSubmit={inviteForm.handleSubmit(handleInviteCollaborator)}
              className={`w-full flex flex-col ${
                Object.keys(inviteForm.formState.errors).length
                  ? "gap-2"
                  : "gap-4"
              }`}
            >
              <div className="w-full grid grid-cols-2 gap-2">
                <FormField
                  control={inviteForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              {inviteForm.formState.errors?.email && (
                <p className="text-red-500 text-sm">
                  {inviteForm.formState.errors.email.message}
                </p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

export type AccessDialogType = "invite" | "removeAccess";
export function AccessDialogContent({
  dialogType,
  ...props
}: AccessDialogContentProps & { dialogType: AccessDialogType | null }) {
  if (dialogType === "invite") {
    return InviteDialog(props);
  } else if (dialogType === "removeAccess") {
    return RemoveAccessConfirmationDialog(props);
  }
  return null;
}

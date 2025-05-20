import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import {
  JournalDetailedDto,
  JournalUserBasicDto,
} from "@/modules/journals/application/dto/dtos.types";
import { JournalApi } from "@/modules/journals/presentation/api/journal.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash, UserPlus2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  accessType: z.enum(["read", "write"]),
});

type InviteFormSchema = z.infer<typeof inviteSchema>;

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
  const inviteForm = useForm<InviteFormSchema>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      accessType: "write",
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const authContext = useAuthContext();

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
      setIsOpen(false);
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      // Handle error (e.g., show a notification)
      toast.error("Failed to invite collaborator. Please try again.");
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await api.removeCollaborator({ journalId: journal.id, userId });
      setIsOpen(false);
    } catch (error) {
      console.log("Error removing collaborator", error);
      toast.error("Failed to remove collaborator. Please try again.");
    }
  };

  const showInviteForm = () => {
    setContent(
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
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
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
    setIsOpen(true);
  };

  const showDeleteConfirmation = (user: JournalUserBasicDto) => {
    setContent(
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
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              No
            </Button>
          </CardFooter>
        </Card>
      </>
    );
    setIsOpen(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Users with Access</h2>
        <Button variant="secondary" onClick={showInviteForm}>
          <UserPlus2 />
          Invite to Workspace
        </Button>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">{content}</DialogContent>
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
                >
                  <Trash
                    className="w-5 text-destructive cursor-pointer"
                    onClick={() => showDeleteConfirmation(user.user)}
                  />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Collaborator {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface CollaboratorsProps {
  collaborators: Collaborator[];
  maxDisplayed?: number;
  size?: "sm" | "md" | "lg";
}

export function Collaborators({
  collaborators,
  maxDisplayed = 3,
  size = "md",
}: CollaboratorsProps) {
  if (!collaborators.length) return null;

  const displayedCollaborators = collaborators.slice(0, maxDisplayed);
  const remainingCount = collaborators.length - maxDisplayed;

  // Determine avatar size based on the size prop
  const avatarSizeClass = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }[size];

  // Determine the overlap margin based on size
  const overlapMargin = {
    sm: "-mr-1.5",
    md: "-mr-2",
    lg: "-mr-2.5",
  }[size];

  // Determine the font size for the counter
  const counterFontSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  // Determine the counter size
  const counterSizeClass = avatarSizeClass;

  return (
    <div className="flex items-center">
      <div className="flex">
        {displayedCollaborators.map((collaborator, index) => (
          <div
            key={collaborator.id}
            className={`${
              index !== 0 ? overlapMargin : ""
            } ring-2 ring-background rounded-full`}
            style={{ zIndex: displayedCollaborators.length - index }}
          >
            <Avatar className={cn(avatarSizeClass)}>
              <AvatarImage
                src={collaborator.avatarUrl || "/placeholder.svg"}
                alt={`${collaborator.firstName} ${collaborator.lastName}`}
              />
              <AvatarFallback>
                {collaborator.firstName[0] + collaborator.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <div
          className={`${overlapMargin} flex items-center justify-center bg-muted text-muted-foreground rounded-full ring-2 ring-background ${counterSizeClass} ${counterFontSize} font-medium`}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

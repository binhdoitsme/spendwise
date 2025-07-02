"use client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TagDto } from "@/modules/journals/application/dto/dtos.types";
import { Plus, Tag as TagIcon } from "lucide-react";
import { MouseEventHandler } from "react";
import { Colorized } from "./tag-colors";

export function TagItem({ tag }: { tag: TagDto & Colorized }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "cursor-default",
        "border-gray-50",
        ...Object.values(tag.color)
      )}
    >
      {tag.name}
    </Badge>
  );
}

export function ManageTagsButton({
  onClick,
}: {
  onClick?: MouseEventHandler<HTMLSpanElement>;
}) {
  return (
    <Badge className="cursor-pointer" onClick={onClick}>
      <TagIcon /> Manage Tags
    </Badge>
  );
}

export function Tags({
  tags,
  maxVisibleTags = 3,
  handleManageTags,
  handleAddTag,
}: {
  tags: (TagDto & Colorized)[];
  maxVisibleTags?: number;
  handleManageTags?: MouseEventHandler<HTMLSpanElement>;
  handleAddTag?: (tag: string) => void;
}) {
  const visibleTags = tags.slice(0, maxVisibleTags);
  return (
    <div className="flex justify-end md:justify-start gap-2 md:flex-wrap">
      {!!handleAddTag && (
        <Badge
          variant="outline"
          className="cursor-pointer"
          onClick={() => alert("alert")}
        >
          <Plus />
        </Badge>
      )}
      {visibleTags.filter(Boolean).map((tag) => (
        <TagItem key={tag.id} tag={tag} />
      ))}
      {handleManageTags && <ManageTagsButton onClick={handleManageTags} />}
    </div>
  );
}

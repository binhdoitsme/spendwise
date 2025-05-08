"use client";
import { Badge } from "@/components/ui/badge";
import { TagDto } from "@/modules/journals/application/dto/dtos.types";
import { Tag as TagIcon } from "lucide-react";
import { MouseEventHandler } from "react";

export function TagItem({ tag }: { tag: TagDto }) {
  return (
    <Badge variant="outline" className="cursor-default">
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
}: {
  tags: TagDto[];
  maxVisibleTags?: number;
  handleManageTags?: MouseEventHandler<HTMLSpanElement>;
}) {
  const visibleTags = tags.slice(0, maxVisibleTags);
  return (
    <div className="flex gap-2 flex-wrap">
      {visibleTags.map((tag) => (
        <TagItem key={tag.id} tag={tag} />
      ))}
      {handleManageTags && <ManageTagsButton onClick={handleManageTags} />}
    </div>
  );
}

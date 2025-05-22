import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRef } from "react";

export function TransactionSearch({
  handleSearch,
}: {
  handleSearch: (query: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the onChange handler
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleDebouncedChange =
    (timeout: number = 300) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      const value = e.currentTarget.value;
      debounceTimeout.current = setTimeout(() => {
        handleSearch(value.trim());
      }, timeout); // 300ms debounce
    };

  return (
    <>
      <Input
        placeholder="Search..."
        ref={inputRef}
        onChange={handleDebouncedChange()}
      />
      <Button
        variant="outline"
        onClick={async () => handleSearch(inputRef.current?.value ?? "")}
      >
        <Search />
      </Button>
    </>
  );
}

import { Localizable } from "@/components/common/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRef } from "react";
import { transactionLabels } from "./labels";

interface TransactionSearchProps extends Localizable {
  initValue?: string;
  handleSearch: (query: string) => Promise<void>;
}

export function TransactionSearch({
  handleSearch,
  initValue,
  language,
}: TransactionSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labels = transactionLabels[language];

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
        placeholder={labels.searchPlaceholder}
        ref={inputRef}
        defaultValue={initValue}
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

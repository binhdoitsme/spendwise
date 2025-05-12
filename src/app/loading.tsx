import { LoadingSpinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="w-full h-[calc(100vh-16rem)] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

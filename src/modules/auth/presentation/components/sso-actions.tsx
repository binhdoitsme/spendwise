import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/spinner";
import { AuthLabels } from "./labels";

const SUPPORTED_SSO_PROVIDERS = new Set(["google"]);

export interface SSOLoginActionsProps {
  ssoProviders: Set<string>;
  labels: AuthLabels;
  isSubmitting?: boolean;
}

export function SSOLoginActions({
  ssoProviders,
  labels,
  isSubmitting,
}: SSOLoginActionsProps) {
  const finalSsoProviders = new Set(
    Array.from(ssoProviders).filter((provider) =>
      SUPPORTED_SSO_PROVIDERS.has(provider)
    )
  );
  return (
    finalSsoProviders.size > 0 && (
      <>
        <div className="my-4 text-center text-sm text-gray-500">
          {labels.orLabel}
        </div>
        {finalSsoProviders.has("google") && (
          <div className="space-y-2">
            <Button
              className="w-full"
              variant="outline"
              disabled={isSubmitting}
            >
              {labels.signInGoogle}
              {isSubmitting && <LoadingSpinner />}
            </Button>
          </div>
        )}
      </>
    )
  );
}

"use client";

import { useAuthContext } from "@/modules/auth/presentation/components/auth-context";
import { UserApi } from "@/modules/users/presentation/api/user.api";
import {
  ProfileForm,
  ProfileFormSchema,
} from "@/modules/users/presentation/components/profile-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CompleteProfilePage() {
  const api = new UserApi();
  const router = useRouter();
  const authContext = useAuthContext();

  const handleCompleteProfile = async (data: ProfileFormSchema) => {
    try {
      await api.updateUserProfile({
        ...data,
        dob: data.dob.toISOString().split("T")[0],
      });
      await api.getMyProfile().then((user) => authContext.setUser(user));
      toast.success("Successfully completed profile!");
      router.push("/journals");
    } catch (err) {
      console.error(err);
      toast.error("Unable to complete profile!");
    }
  };

  return (
    <div className="w-full h-screen mt-8 flex flex-col items-center justify-start overflow-scroll">
      <ProfileForm onSubmit={handleCompleteProfile} />
    </div>
  );
}

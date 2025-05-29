"use client";

import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const SignOutButton = () => {
  return (
    <Button
      className="w-fit"
      onClick={() =>
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              redirect("/authentication");
            },
          },
        })
      }
    >
      Sair
    </Button>
  );
};

export default SignOutButton;

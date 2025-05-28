"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  const redirectToAuthentication = () => {
    router.push("/authentication");
  };

  return <Button onClick={redirectToAuthentication}>Bootcamp!</Button>;
}

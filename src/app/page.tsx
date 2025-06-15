"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/authentication");
  }, [router]); // executa 1 vez quando o componente monta

  const redirectToAuthentication = () => {
    router.push("/authentication");
  };

  return <Button onClick={redirectToAuthentication}>Iniciar</Button>;
}

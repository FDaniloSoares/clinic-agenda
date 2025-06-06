"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";

import { upsertPatient } from "@/actions/upsert-patient";
import { Schema, schema } from "@/actions/upsert-patient/schema";
import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  isOpen: boolean;
  onSuccess?: () => void;
  defaultValues?: Schema;
}

export function UpsertPatientForm({ isOpen, onSuccess, defaultValues }: Props) {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: "",
      email: "",
      phoneNumber: "",
      sex: undefined,
    },
  });

  const { execute, status } = useAction(upsertPatient, {
    onSuccess: () => {
      toast.success("Paciente salvo com sucesso");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(
        (error.error.serverError as string) || "Erro ao salvar paciente",
      );
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    execute(data);
  });

  // Marter o array de mudança para detectar apanas na mudança do mesmo
  useEffect(() => {
    if (isOpen) {
      form.reset(defaultValues);
    }
  }, [isOpen, defaultValues, form]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {defaultValues ? "Editar paciente" : "Adicionar paciente"}
        </DialogTitle>
        <DialogDescription>
          {defaultValues
            ? "Edite os dados do paciente"
            : "Preencha os dados do paciente"}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do paciente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email do paciente"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="(##) #####-####"
                    mask="_"
                    customInput={Input}
                    placeholder="(00) 00000-0000"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={status === "executing"}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

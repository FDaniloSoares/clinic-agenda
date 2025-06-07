"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertAppointment } from "@/actions/upsert-appointment";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable, pacientsTable } from "@/db/schema";

const formSchema = z.object({
  patientId: z.string({
    required_error: "Selecione um paciente",
  }),
  doctorId: z.string({
    required_error: "Selecione um médico",
  }),
  appointmentPriceInCents: z.number({
    required_error: "Informe o valor da consulta",
  }),
  date: z.date({
    required_error: "Selecione uma data",
  }),
  horario: z.string({
    required_error: "Selecione um horário",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof pacientsTable.$inferSelect)[];
  children: React.ReactNode;
}

export function UpsertAppointmentForm({ doctors, patients, children }: Props) {
  const [open, setOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === form.watch("doctorId"),
  );

  const { execute, status } = useAction(upsertAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso");
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao criar agendamento");
    },
  });

  const onSubmit = (values: FormValues) => {
    execute(values);
  };

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  useEffect(() => {
    form.setValue(
      "appointmentPriceInCents",
      selectedDoctor?.appointmentPriceInCents ?? 0,
    );
  }, [form, selectedDoctor]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Paciente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Médico</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um médico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointmentPriceInCents"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Valor da consulta</FormLabel>
                  <FormControl>
                    <NumericFormat
                      customInput={Input}
                      value={
                        field.value
                          ? field.value / 100
                          : selectedDoctor?.appointmentPriceInCents
                            ? selectedDoctor.appointmentPriceInCents / 100
                            : undefined
                      }
                      onValueChange={(values) => {
                        field.onChange(values.floatValue! * 100);
                      }}
                      disabled={!selectedDoctor}
                      prefix="R$ "
                      decimalScale={2}
                      fixedDecimalScale
                      decimalSeparator=","
                      thousandSeparator="."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col items-start justify-items-start">
                  <FormLabel>Data</FormLabel>
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger
                      className="w-full items-start justify-start"
                      asChild
                    >
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                          disabled={
                            !form.watch("doctorId") || !form.watch("patientId")
                          }
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setDatePickerOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="horario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch("date")}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um horário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Manhã</SelectLabel>
                        <SelectItem value="05:00:00">05:00</SelectItem>
                        <SelectItem value="05:30:00">05:30</SelectItem>
                        <SelectItem value="06:00:00">06:00</SelectItem>
                        <SelectItem value="06:30:00">06:30</SelectItem>
                        <SelectItem value="07:00:00">07:00</SelectItem>
                        <SelectItem value="07:30:00">07:30</SelectItem>
                        <SelectItem value="08:00:00">08:00</SelectItem>
                        <SelectItem value="08:30:00">08:30</SelectItem>
                        <SelectItem value="09:00:00">09:00</SelectItem>
                        <SelectItem value="09:30:00">09:30</SelectItem>
                        <SelectItem value="10:00:00">10:00</SelectItem>
                        <SelectItem value="10:30:00">10:30</SelectItem>
                        <SelectItem value="11:00:00">11:00</SelectItem>
                        <SelectItem value="11:30:00">11:30</SelectItem>
                        <SelectItem value="12:00:00">12:00</SelectItem>
                        <SelectItem value="12:30:00">12:30</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Tarde</SelectLabel>
                        <SelectItem value="13:00:00">13:00</SelectItem>
                        <SelectItem value="13:30:00">13:30</SelectItem>
                        <SelectItem value="14:00:00">14:00</SelectItem>
                        <SelectItem value="14:30:00">14:30</SelectItem>
                        <SelectItem value="15:00:00">15:00</SelectItem>
                        <SelectItem value="15:30:00">15:30</SelectItem>
                        <SelectItem value="16:00:00">16:00</SelectItem>
                        <SelectItem value="16:30:00">16:30</SelectItem>
                        <SelectItem value="17:00:00">17:00</SelectItem>
                        <SelectItem value="17:30:00">17:30</SelectItem>
                        <SelectItem value="18:00:00">18:00</SelectItem>
                        <SelectItem value="18:30:00">18:30</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Noite</SelectLabel>
                        <SelectItem value="19:00:00">19:00</SelectItem>
                        <SelectItem value="19:30:00">19:30</SelectItem>
                        <SelectItem value="20:00:00">20:00</SelectItem>
                        <SelectItem value="20:30:00">20:30</SelectItem>
                        <SelectItem value="21:00:00">21:00</SelectItem>
                        <SelectItem value="21:30:00">21:30</SelectItem>
                        <SelectItem value="22:00:00">22:00</SelectItem>
                        <SelectItem value="22:30:00">22:30</SelectItem>
                        <SelectItem value="23:00:00">23:00</SelectItem>
                        <SelectItem value="23:30:00">23:30</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={status === "executing"}>
                {status === "executing" ? "Criando..." : "Criar Agendamento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

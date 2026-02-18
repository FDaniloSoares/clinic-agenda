"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { addAppointment } from "@/actions/add-appointment";
import { getAvailableTimes } from "@/actions/get-available-times";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable, pacientsTable } from "@/db/schema";

const formSchema = z.object({
  patientId: z.string({
    required_error: "Select a patient",
  }),
  doctorId: z.string({
    required_error: "Select a doctor",
  }),
  appointmentPriceInCents: z.number({
    required_error: "Enter appointment price",
  }),
  date: z.date({
    required_error: "Select a date",
  }),
  horario: z.string({
    required_error: "Select a time",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof pacientsTable.$inferSelect)[];
  children: React.ReactNode;
}

export function AddAppointmentForm({ doctors, patients, children }: Props) {
  const [open, setOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === form.watch("doctorId"),
  );

  const { execute, status } = useAction(addAppointment, {
    onSuccess: () => {
      toast.success("Appointment created successfully");
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error?.error?.serverError || "Failed to create appointment");
    },
  });

  const onSubmit = (values: FormValues) => {
    execute(values);
  };

  const isDateAvalable = (date: Date) => {
    const selectedDoctor = doctors.find(
      (doctor) => doctor.id === form.watch("doctorId"),
    );

    if (!selectedDoctor) {
      return false;
    }

    const dayOfWeek = dayjs(date).day();

    return (
      dayOfWeek >= selectedDoctor.availableFromWeekday &&
      dayOfWeek <= selectedDoctor.availableToWeekday
    );
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

  const { data: availableTimes } = useQuery({
    queryKey: ["available-times", form.watch("date"), form.watch("doctorId")],
    queryFn: () => {
      return getAvailableTimes({
        doctorId: form.watch("doctorId"),
        date: form.watch("date"),
      });
    },
    enabled: !!form.watch("date") && !!form.watch("doctorId"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
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
                  <FormLabel>Patient</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a patient" />
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
                  <FormLabel>Doctor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a doctor" />
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
                  <FormLabel>Appointment price</FormLabel>
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
                  <FormLabel>Date</FormLabel>
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
                            format(field.value, "PPP")
                          ) : (
                            <span>Select a date</span>
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
                        disabled={(date) =>
                          date < new Date() || !isDateAvalable(date)
                        }
                        
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
                  <FormLabel>Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch("date")}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimes?.data?.map((time) => (
                        <SelectItem
                          key={time.value}
                          value={time.value}
                          disabled={!time?.isAvailable}
                        >
                          {time.value.split(":")[0]}:{time.value.split(":")[1]}
                          {!time?.isAvailable && " Unavailable"}
                        </SelectItem>
                      ))}
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
                {status === "executing" ? "Creating..." : "Create Appointment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

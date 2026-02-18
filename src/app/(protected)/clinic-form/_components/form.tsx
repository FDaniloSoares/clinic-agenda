"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { createClinic } from "@/actions/create-clinis";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const clinicFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

const ClinicForm = () => {
  const router = useRouter();

  const formClinic = useForm<z.infer<typeof clinicFormSchema>>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof clinicFormSchema>) => {
    try {
      await createClinic(values.name);
      toast.success("Clinic created successfully");
      formClinic.reset();
      router.push("/dashboard");
    } catch {
      toast.error("Failed to create clinic");
    }
  };

  return (
    <Form {...formClinic}>
      <form onSubmit={formClinic.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={formClinic.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button
            type="submit"
            className="min-w-32"
            disabled={formClinic.formState.isSubmitting}
          >
            {formClinic.formState.isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Create clinic
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ClinicForm;

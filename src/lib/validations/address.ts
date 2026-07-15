import { z } from "zod";
import { addressSchema } from "@/lib/validations/checkout";

export const addressBookSchema = addressSchema.extend({
  isDefault: z.boolean().optional(),
});
export type AddressBookInput = z.infer<typeof addressBookSchema>;

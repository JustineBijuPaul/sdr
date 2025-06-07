import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import {
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Extend the inquiry schema with additional validation
const contactFormSchema = insertInquirySchema.extend({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  subject: z.string(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactSection() {
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      subject: "Property Inquiry",
    },
  });

  const createInquiryMutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      const res = await apiRequest("POST", "/api/inquiries", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry submitted",
        description: "We will get back to you soon!",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: ContactFormValues) {
    createInquiryMutation.mutate(values);
  }

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
            <p className="text-gray-600 mb-8">
              Have questions or need assistance? Fill out the form and our team
              will get back to you as soon as possible.
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
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
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Property Inquiry">
                            Property Inquiry
                          </SelectItem>
                          <SelectItem value="Selling a Property">
                            Selling a Property
                          </SelectItem>
                          <SelectItem value="Renting a Property">
                            Renting a Property
                          </SelectItem>
                          <SelectItem value="General Information">
                            General Information
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your message"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={createInquiryMutation.isPending}
                >
                  {createInquiryMutation.isPending
                    ? "Sending..."
                    : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 h-full">
              <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Our Office</h4>
                    <p className="text-gray-600">
                      Ward no. 1, Shop No.3, Desu Road, near Canara Bank, New Delhi, Delhi 110030
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Phone</h4>
                    <p className="text-gray-600">+91 98733 76605</p>
                    <p className="text-gray-600">+91 99112 48822</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Email</h4>
                    <p className="text-gray-600">southdelhirealti@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Working Hours</h4>
                    <p className="text-gray-600">
                      Monday - Saturday: 11:00 AM - 7:00 PM
                    </p>
                    <p className="text-gray-600">Sunday: By Appointment Only</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-bold mb-3">Follow Us</h4>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.facebook.com/profile.php?id=100091444635702&mibextid=rS40aB7S9Ucbxw6v"
                      target="_blank"
                      className="bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition"
                    >
                      <Facebook size={18} className="text-primary" />
                    </a>
                    <a
                      href="https://www.instagram.com/southdelhirealty"
                      target="_blank"
                      className="bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition"
                    >
                      <Instagram size={18} className="text-primary" />
                    </a>
                    <a
                      href="https://wa.me/919911248822?text=message_text"
                      target="_blank"
                      className="bg-primary/10 p-3 rounded-full hover:bg-primary/20 transition"
                    >
                      <MessageCircle size={18} className="text-primary" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

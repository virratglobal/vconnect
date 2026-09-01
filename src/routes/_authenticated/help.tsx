import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Search,
  Mail,
  BookOpen,
  Key,
  Users,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({ meta: [{ title: "Help & Support · Virrat Reach" }] }),
  component: HelpPage,
});

const docCategories = [
  {
    title: "Getting Started",
    description:
      "Learn how to set up your account, invite team members, and navigate the platform.",
    icon: BookOpen,
    link: "#",
  },
  {
    title: "WhatsApp API Credentials",
    description:
      "Configure Meta WhatsApp Business Platform API credentials, tokens, and templates.",
    icon: Key,
    link: "#",
  },
  {
    title: "Contacts Management",
    description: "Import lists, create tags, filter, and organize your WhatsApp customer database.",
    icon: Users,
    link: "#",
  },
  {
    title: "Campaigns & Messaging",
    description:
      "Create interactive templates, run bulk broadcast campaigns, and view response analytics.",
    icon: MessageSquare,
    link: "#",
  },
];

const faqs = [
  {
    question: "How do I connect my WhatsApp Business number?",
    answer:
      "Go to Settings -> WhatsApp Settings, and enter your Phone Number ID, WhatsApp Business Account ID, and permanent Graph API Access Token. You can generate these credentials within your Meta Developer Dashboard.",
    category: "credentials",
  },
  {
    question: "What is the template approval process?",
    answer:
      "WhatsApp requires all business-initiated messages to use pre-approved templates. You can submit new templates directly from the Templates section. Meta typically reviews and approves templates within 2 to 24 hours.",
    category: "campaigns",
  },
  {
    question: "How do I import contacts from a CSV file?",
    answer:
      "Navigate to Contacts -> CSV Import, upload your CSV file, map the phone number and name columns, assign tags (optional), and click Import. Ensure all phone numbers are formatted in full international format (e.g. +1... or +91...).",
    category: "contacts",
  },
  {
    question: "What roles are available for organization members?",
    answer:
      "We support four roles: Owner (full access and billing), Admin (can manage settings and members), Manager (can create campaigns and import contacts), and Agent (can view reports and chat with customers).",
    category: "getting-started",
  },
  {
    question: "How are message rate limits handled?",
    answer:
      "Meta enforces tiered daily rate limits (1K, 10K, 100K, or unlimited unique recipients) depending on your business verification status and quality rating. You can check your current limits in Settings -> Billing.",
    category: "getting-started",
  },
];

function HelpPage() {
  const [search, setSearch] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSupportEmail = () => {
    window.location.href =
      "mailto:support@virratreach.com?subject=Virrat%20Reach%20Support%20Request";
    toast.success("Opening default email client...");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Help & Support</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Browse guides, search frequently asked questions, or contact our support team.
          </p>
        </div>
        <div className="relative w-full md:max-w-md">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search FAQs and documentation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card rounded-xl border-border/50"
          />
        </div>
      </div>

      {/* Grid of Doc Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {docCategories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Card
              key={idx}
              className="border-border/50 hover:border-primary/40 bg-card hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between group"
            >
              <CardHeader className="space-y-2">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-base font-bold mt-2">{cat.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-3 leading-relaxed">
                  {cat.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 text-xs font-semibold text-primary hover:bg-transparent hover:text-primary/80 gap-1 mt-2"
                >
                  Read Guides <ExternalLink className="size-3" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        {/* FAQs Accordion (Left: 70%) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/50 rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <HelpCircle className="size-5 text-primary" /> Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Quick answers to common questions about setting up and running WhatsApp campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`} className="border-border/50">
                      <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary text-left py-3.5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs leading-relaxed text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No FAQs match your search criteria. Try a different search term.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Support Options (Right: 30%) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/50 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Still need help?</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Can't find what you're looking for? Reach out directly to our dedicated customer
                success team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleSupportEmail}
                className="w-full h-11 bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl gap-2 shadow-lg shadow-[#CC1100]/20"
              >
                <Mail className="size-4" /> Email Support
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl border-input hover:bg-muted font-semibold"
                onClick={() => toast.info("Live chat is currently offline. Please email support.")}
              >
                Start Live Chat
              </Button>
              <div className="text-[10px] text-muted-foreground text-center pt-2">
                Typical response time: under 2 hours
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

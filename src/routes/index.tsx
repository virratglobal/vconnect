import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { SEO_CONFIG } from "@/lib/seo-config";
import { SEO } from "@/components/seo/SEO";
import {
  MessageSquare,
  ArrowRight,
  Check,
  ChevronDown,
  AlertCircle,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Phone,
  Settings,
  Users,
  FileText,
  Send,
  HelpCircle,
  Sparkles,
  Play,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => {
    const title = "CONVEXA – AI-Powered WhatsApp CRM for Businesses";
    const description =
      "Send bulk WhatsApp broadcasts, build AI chatbots, manage customer chats with a shared inbox, run voice campaigns, and automate customer engagement.";
    const url = SEO_CONFIG.siteUrl;
    const ogImage = `${SEO_CONFIG.siteUrl}${SEO_CONFIG.ogImage}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content:
            "WhatsApp CRM, Bulk WhatsApp Sender, WhatsApp Marketing, AI Chatbot, Shared Inbox, Voice Campaigns, CONVEXA",
        },
        // Open Graph
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: ogImage },
        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        {
          rel: "canonical",
          href: url,
        },
      ],
    };
  },
  component: LandingPage,
});

interface FAQItem {
  id: string;
  num: string;
  question: string;
  answer: string;
}

const ribbon1Logos = [
  {
    name: "Zapier",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/zapier.svg",
    maxH: "max-h-7",
  },
  {
    name: "HubSpot",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/hubspot.svg",
    maxH: "max-h-7",
  },
  {
    name: "WooCommerce",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/woocommerce.svg",
    maxH: "max-h-6",
  },
  {
    name: "Shopify",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/shopify.svg",
    maxH: "max-h-7",
  },
  {
    name: "Slack",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/slack.svg",
    maxH: "max-h-7",
  },
  {
    name: "Salesforce",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/salesforce.svg",
    maxH: "max-h-7",
  },
  {
    name: "Notion",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/notion.svg",
    maxH: "max-h-7",
  },
  { name: "Excel", src: "https://svgl.app/library/microsoft-excel.svg", maxH: "max-h-7" },
];

const ribbon2Logos = [
  {
    name: "WhatsApp",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/whatsapp.svg",
    maxH: "max-h-7",
  },
  {
    name: "Stripe",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/stripe.svg",
    maxH: "max-h-6",
  },
  {
    name: "Telegram",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/telegram.svg",
    maxH: "max-h-7",
  },
  {
    name: "Twilio",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/twilio.svg",
    maxH: "max-h-7",
  },
  {
    name: "Zoho",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/zoho.svg",
    maxH: "max-h-7",
  },
  {
    name: "Mailchimp",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/mailchimp.svg",
    maxH: "max-h-7",
  },
  {
    name: "Pipedrive",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/pipedrive.svg",
    maxH: "max-h-7",
  },
  {
    name: "Gmail",
    src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/google-gmail.svg",
    maxH: "max-h-7",
  },
];

function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      num: "01",
      question: "What is CONVEXA and how does it work?",
      answer:
        "CONVEXA is a comprehensive customer growth and engagement platform that helps businesses run bulk WhatsApp marketing campaigns, build chatbots, manage agent tasks, and handle team conversations from a single dashboard. It connects to your WhatsApp number via QR code or the official Meta Business API.",
    },
    {
      id: "faq-2",
      num: "02",
      question: "Do I need a verified WhatsApp Business account?",
      answer:
        "No, you do not need a verified business account to start. You can scan our secure QR code to link your existing WhatsApp number in minutes. For higher broadcast limits, we also provide a step-by-step wizard to connect via official Meta Cloud APIs.",
    },
    {
      id: "faq-3",
      num: "03",
      question: "Is there a free trial available?",
      answer:
        "Yes! We offer a full-featured 10-day trial with all premium features unlocked, including chatbot automations, tags, notes, and contact imports. No credit card is required to sign up.",
    },
    {
      id: "faq-4",
      num: "04",
      question: "Can I broadcast messages to thousands of contacts?",
      answer:
        "Yes. CONVEXA enables bulk broadcasting to your contact book. When using the official WhatsApp API, you can send template messages concurrently. The built-in template builder helps you get approval from Meta automatically.",
    },
    {
      id: "faq-5",
      num: "05",
      question: "How does the AI chatbot builder work?",
      answer:
        "Our visual chatbot builder allows you to construct interactive response flows using drag-and-drop actions. You can qualify leads, trigger auto-replies, apply contact tags, and route complex inquiries to live human agents.",
    },
    {
      id: "faq-6",
      num: "06",
      question: "Can multiple agents use the same WhatsApp number?",
      answer:
        "Absolutely! All incoming chats and replies flow into a unified shared team inbox. You can add agents, assign individual conversations, share internal notes, and monitor response rates all under one number.",
    },
    {
      id: "faq-7",
      num: "07",
      question: "Is my data secure?",
      answer:
        "Yes, security is our top priority. We use industry-standard HTTPS protocols, encrypt your WhatsApp credentials securely, host database records on enterprise cloud environments, and adhere to official WhatsApp Business policies.",
    },
  ];

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="bg-white text-gray-900 font-sans min-h-screen">
      <SEO
        title="AI-Powered WhatsApp CRM for Businesses"
        description="Send bulk WhatsApp broadcasts, build AI chatbots, manage customer chats with a shared inbox, run voice campaigns, and automate customer engagement."
        keywords="WhatsApp CRM, bulk WhatsApp sender, WhatsApp marketing, AI chatbot, shared inbox, voice campaigns, CONVEXA"
        canonical="/"
      />
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="CONVEXA"
              className="h-14 w-auto object-contain"
              fetchPriority="high"
            />
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
            <a className="hover:text-[#CC1100] transition" href="#features">
              Features
            </a>
            <a className="hover:text-[#CC1100] transition" href="#pricing">
              Pricing
            </a>
            <a className="hover:text-[#CC1100] transition" href="#faq">
              FAQ
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button
                variant="ghost"
                className="text-sm font-semibold hover:bg-gray-100 text-gray-700"
              >
                Sign in
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-[#CC1100] hover:bg-[#B00E00] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm">
                Get started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#CC1100]/5 via-white to-white pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-[#FEE2E2] text-[#CC1100] border border-[#CC1100]/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-[#CC1100] rounded-full mr-2 animate-pulse"></span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">
              Now with AI Voice Calling
            </span>
            <span className="ml-2 bg-[#CC1100] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
              NEW
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            The #1 <br />
            <span className="text-[#CC1100]">Bulk Broadcasting</span>
            <br />
            growth platform
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-500 mb-10 leading-relaxed">
            Send bulk messages, deploy AI chatbots, manage your team inbox, run voice call campaigns
            and automate everything — no code needed.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <Link to="/auth">
              <Button className="bg-[#CC1100] hover:bg-[#B00E00] text-white px-8 py-6 rounded-xl text-lg font-bold shadow-lg shadow-[#CC1100]/20 flex items-center h-14">
                Get started free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#features">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-8 py-6 text-lg font-semibold text-gray-700 hover:text-[#CC1100] transition h-14"
              >
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                See how it works
              </Button>
            </a>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex -space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">
                SJ
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                ML
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-teal-500 flex items-center justify-center text-[10px] text-white font-bold">
                PS
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-yellow-500 flex items-center justify-center text-[10px] text-white font-bold">
                CR
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                AK
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-500">
                Loved by <span className="font-bold text-gray-900">50,000+</span> businesses
                worldwide
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white text-gray-500 border border-gray-200 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-[#CC1100] rounded-full mr-2"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Integrations & Partners
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Works with tools <span className="text-[#CC1100]/70">you already use</span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500 mb-16">
            Connect your favorite platforms in minutes — no engineering required.
          </p>

          {/* Ribbon 1: Moving Left */}
          <div className="relative w-full overflow-hidden py-3">
            {/* Gradient masks for smooth fade edges */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50/50 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50/50 to-transparent z-10 pointer-events-none" />

            <div className="flex gap-4 w-max animate-marquee-left">
              {/* Render logos first time */}
              {ribbon1Logos.map((logo, idx) => (
                <div
                  key={`r1-${idx}`}
                  className="flex-shrink-0 w-40 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={`${logo.maxH || "max-h-7"} w-auto object-contain`}
                    loading="lazy"
                  />
                </div>
              ))}
              {/* Duplicate logos to ensure seamless looping */}
              {ribbon1Logos.map((logo, idx) => (
                <div
                  key={`r1-dup-${idx}`}
                  className="flex-shrink-0 w-40 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={`${logo.maxH || "max-h-7"} w-auto object-contain`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Ribbon 2: Moving Right */}
          <div className="relative w-full overflow-hidden py-3 mt-4">
            {/* Gradient masks for smooth fade edges */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50/50 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50/50 to-transparent z-10 pointer-events-none" />

            <div className="flex gap-4 w-max animate-marquee-right">
              {/* Render logos first time */}
              {ribbon2Logos.map((logo, idx) => (
                <div
                  key={`r2-${idx}`}
                  className="flex-shrink-0 w-40 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm p-4 opacity-50 hover:opacity-100 hover:shadow-md transition-all"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={`${logo.maxH || "max-h-7"} w-auto object-contain`}
                    loading="lazy"
                  />
                </div>
              ))}
              {/* Duplicate logos to ensure seamless looping */}
              {ribbon2Logos.map((logo, idx) => (
                <div
                  key={`r2-dup-${idx}`}
                  className="flex-shrink-0 w-40 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm p-4 opacity-50 hover:opacity-100 hover:shadow-md transition-all"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={`${logo.maxH || "max-h-7"} w-auto object-contain`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Tabs Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureShowcase />
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block bg-[#FEE2E2] text-[#CC1100] border border-[#CC1100]/20 rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4">
              Everything you need
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              One platform, <span className="text-[#CC1100]/70">every feature</span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-500">
              From connecting WhatsApp to deploying AI call agents — CONVEXA gives your team
              every tool to automate, broadcast, and grow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-7 h-7" />
                </div>
                <span className="bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded">
                  Multi-channel
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Connect WhatsApp Your Way</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Link via QR scan, Meta Embed Login, or manual API setup. Supports both WhatsApp QR
                Plugin and Meta Business API — all from one dashboard.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  QR Code connect
                </span>
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Meta embed login
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                  <Zap className="w-7 h-7" />
                </div>
                <span className="bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded">
                  No-code
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Automation Flows &amp; Chatbots
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Build powerful WhatsApp chatbots and automation flows with a drag-and-drop builder.
                Trigger actions, route conversations, and respond instantly — zero code.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Visual builder
                </span>
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Chatbots
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <Send className="w-7 h-7" />
                </div>
                <span className="bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded">
                  Broadcasting
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Campaigns &amp; Broadcasting</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Create Meta-approved templates, send bulk campaigns to your phonebook, and track
                every message from a live campaign dashboard.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Template builder
                </span>
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Bulk blasts
                </span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Phone className="w-7 h-7" />
                </div>
                <span className="bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded">
                  AI - Premium
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">AI WhatsApp Calling</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Deploy an AI voice agent that handles WhatsApp calls 24/7. Build call flows, review
                call logs, and qualify leads automatically without extra staffing.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  AI Voice Agents
                </span>
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Call Analytics
                </span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-[#FEE2E2] text-[#CC1100] rounded-2xl flex items-center justify-center">
                  <Settings className="w-7 h-7" />
                </div>
                <span className="bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded">
                  Developer
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Webhooks &amp; REST API</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Integrate CONVEXA with any external tool using webhooks and the Meta REST API.
                Automate routing logic, sync data, and monitor events in real time.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Webhooks
                </span>
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Rest API
                </span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <span className="bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded">
                  Team
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Inbox, Agents &amp; Tasks</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Manage your entire support team from one unified inbox. Assign conversations to
                agents, track tasks, add labels, and monitor performance in real time.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Shared Inbox
                </span>
                <span className="bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                  Task Board
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#FEE2E2] text-[#CC1100] border border-[#CC1100]/20 rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4">
              Simple Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Plans for every <span className="text-[#CC1100]/70">team size</span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-500">
              Start free, scale as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Trial Plan */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-6 text-[#CC1100]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold mb-1">Trial</h3>
                <span className="bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-6 block font-semibold text-xs">
                  Trial
                </span>
                <p className="text-gray-400 text-sm mb-6 font-medium">
                  This is a trial plan with access to all core features to test broadcasting and
                  chatbots.
                </p>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-gray-400 text-sm ml-1 font-semibold">For 10 days</span>
                </div>
              </div>
              <div>
                <Link to="/auth">
                  <Button
                    variant="outline"
                    className="w-full py-6 border-2 border-[#CC1100] text-[#CC1100] font-bold rounded-xl mb-8 hover:bg-[#FEE2E2] transition-colors"
                  >
                    Start Free Trial
                  </Button>
                </Link>
                <div className="space-y-4 text-sm">
                  <p className="font-bold text-gray-900">Included Features</p>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Check className="w-4 h-4 text-[#CC1100]" />
                    <span>Contact Limit: 100</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Check className="w-4 h-4 text-[#CC1100]" />
                    <span>Chat Tags &amp; Notes</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Check className="w-4 h-4 text-[#CC1100]" />
                    <span>Automated Chatbots</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white p-8 rounded-[40px] border-2 border-[#CC1100] shadow-xl flex flex-col justify-between relative scale-105 z-10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#CC1100] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                ★ Most Popular
              </div>
              <div>
                <div className="w-12 h-12 bg-[#CC1100] rounded-full flex items-center justify-center mb-6 text-white">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold mb-1">Premium</h3>
                <span className="bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-6 block font-semibold text-xs">
                  Paid
                </span>
                <p className="text-gray-400 text-sm mb-6 font-medium">
                  This is a full-year plan best for growing teams, marketing campaigns, and small
                  agencies.
                </p>
                <div className="mb-8">
                  <span className="text-gray-400 text-lg line-through">$699</span>
                  <span className="text-4xl font-extrabold text-[#CC1100] ml-1.5">$499</span>
                  <span className="text-gray-400 text-sm ml-1 block mt-1 font-semibold">
                    For 365 days
                  </span>
                </div>
              </div>
              <div>
                <Link to="/auth">
                  <Button className="w-full py-6 bg-[#CC1100] hover:bg-[#B00E00] text-white font-bold rounded-xl mb-8 shadow-lg shadow-[#CC1100]/30">
                    Get Started
                  </Button>
                </Link>
                <div className="space-y-4 text-sm">
                  <p className="font-bold text-gray-900">Included Features</p>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Check className="w-4 h-4 text-[#CC1100]" />
                    <span>Contact Limit: 5,000</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Check className="w-4 h-4 text-[#CC1100]" />
                    <span>Advanced Flow Builder</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Check className="w-4 h-4 text-[#CC1100]" />
                    <span>API &amp; Webhook Access</span>
                  </div>
                  <div className="border-t border-gray-150 pt-3 flex items-center justify-between text-xs text-yellow-700 font-semibold bg-yellow-50/50 p-2 rounded-lg">
                    <span>QR Code Scans</span>
                    <span>10 Accounts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Platinum Plan */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-6 text-[#CC1100]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold mb-1">Platinum</h3>
                <span className="bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-6 block font-semibold text-xs">
                  Paid
                </span>
                <p className="text-gray-400 text-sm mb-6 font-medium">
                  Designed for enterprise-scale businesses requiring high volumes and dedicated
                  integrations.
                </p>
                <div className="mb-8">
                  <span className="text-gray-400 text-lg line-through">$2,499</span>
                  <span className="text-4xl font-extrabold text-[#CC1100] ml-1.5">$1,899</span>
                  <span className="text-gray-400 text-sm ml-1 block mt-1 font-semibold">
                    For 365 days
                  </span>
                </div>
              </div>
              <div>
                <Link to="/auth">
                  <Button
                    variant="outline"
                    className="w-full py-6 border-2 border-[#CC1100] text-[#CC1100] font-bold rounded-xl mb-8 hover:bg-[#FEE2E2] transition-colors"
                  >
                    Get Started
                  </Button>
                </Link>
                <div className="space-y-4 text-sm">
                  <p className="font-bold text-gray-900">Included Features</p>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Check className="w-4 h-4 text-[#CC1100]" />
                    <span>Contact Limit: 50,000</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Check className="w-4 h-4 text-[#CC1100]" />
                    <span>AI calling Add-on Included</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Check className="w-4 h-4 text-[#CC1100]" />
                    <span>SLA &amp; Direct Support</span>
                  </div>
                  <div className="border-t border-gray-150 pt-3 flex items-center justify-between text-xs text-yellow-700 font-semibold bg-yellow-50/50 p-2 rounded-lg">
                    <span>QR Code Scans</span>
                    <span>24 Accounts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 mb-16 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#CC1100]" /> End-to-End Encrypted
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#CC1100]" /> 99.9% Uptime SLA
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#CC1100]" /> Sub-second Delivery
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#CC1100]" /> Multi-device Ready
            </div>
          </div>

          <div className="bg-[#FEE2E2] rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <MessageSquare className="w-64 h-64 text-[#CC1100]" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center bg-white text-[#CC1100] border border-[#CC1100]/20 rounded-full px-4 py-1 text-xs font-bold mb-8">
                Get started today
              </div>
              <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                Ready to grow your <br /> business?
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto mb-10 text-base md:text-lg">
                Join 50,000+ businesses already using CONVEXA to automate their WhatsApp
                marketing and support.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link to="/auth">
                  <Button className="bg-[#CC1100] hover:bg-[#B00E00] text-white px-10 py-6 rounded-xl text-lg font-bold shadow-lg shadow-[#CC1100]/20 h-14">
                    Get Started <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button
                    variant="outline"
                    className="bg-white text-gray-700 px-10 py-6 rounded-xl text-lg font-bold border border-gray-200 hover:bg-gray-50 transition h-14"
                  >
                    Talk to Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#FEE2E2] text-[#CC1100] border border-[#CC1100]/20 rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4">
              FAQ
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              Questions we get <span className="text-[#CC1100]/70">all the time</span>
            </h2>
            <p className="text-gray-500">
              Can't find what you're looking for? Reach out to our support team and we'll get back
              to you within a few hours.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => {
              const isOpen = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  onClick={() => toggleFaq(faq.id)}
                  className={`bg-white border rounded-2xl p-6 shadow-sm group cursor-pointer transition-all hover:border-[#CC1100]/50 ${
                    isOpen ? "border-[#CC1100]" : "border-gray-150"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <span
                        className={`font-bold text-2xl transition-colors ${isOpen ? "text-[#CC1100]" : "text-gray-200"}`}
                      >
                        {faq.num}
                      </span>
                      <span className="font-bold text-gray-900 text-sm md:text-base">
                        {faq.question}
                      </span>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isOpen
                          ? "bg-[#CC1100] text-white"
                          : "bg-[#FEE2E2] text-[#CC1100] group-hover:bg-[#CC1100] group-hover:text-white"
                      }`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>
                  {isOpen && (
                    <div className="mt-4 text-xs md:text-sm text-gray-500 leading-relaxed pl-12 border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <img src="/logo.png" alt="CONVEXA" className="h-14 w-auto object-contain" />
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
                The most powerful WhatsApp marketing platform for modern businesses. Automate,
                engage, and grow.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">
                Platform
              </h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li>
                  <a className="hover:text-[#CC1100] transition" href="#features">
                    Features
                  </a>
                </li>
                <li>
                  <a className="hover:text-[#CC1100] transition" href="#pricing">
                    Pricing
                  </a>
                </li>
                <li>
                  <a className="hover:text-[#CC1100] transition" href="#faq">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">
                Legal
              </h4>
              <ul className="space-y-4 text-sm text-gray-500 font-medium">
                <li>
                  <a className="hover:text-[#CC1100] transition" href="#">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a className="hover:text-[#CC1100] transition" href="#">
                    Terms &amp; Conditions
                  </a>
                </li>
                <li>
                  <a className="hover:text-[#CC1100] transition" href="#">
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-gray-400">
            <p>
              © 2026 <span className="text-[#CC1100] font-bold">CONVEXA</span> · All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a className="hover:text-[#CC1100] transition" href="#">
                Back to top
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

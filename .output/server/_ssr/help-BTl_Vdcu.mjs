import { o as __toESM } from "../_runtime.mjs";
import { a as Trigger2, i as Root2, n as Header, r as Item, t as Content2, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { Ct as BookOpen, J as Key, R as MessageSquare, U as Mail, Vt as CircleQuestionMark, _t as ChevronDown, o as Users, ot as ExternalLink, w as Search } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/help-BTl_Vdcu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Accordion = Root2;
var AccordionItem = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
	ref,
	className: cn("border-b", className),
	...props
}));
AccordionItem.displayName = "AccordionItem";
var AccordionTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
	className: "flex",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger2, {
		ref,
		className: cn("flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })]
	})
}));
AccordionTrigger.displayName = Trigger2.displayName;
var AccordionContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("pb-4 pt-0", className),
		children
	})
}));
AccordionContent.displayName = Content2.displayName;
var docCategories = [
	{
		title: "Getting Started",
		description: "Learn how to set up your account, invite team members, and navigate the platform.",
		icon: BookOpen,
		link: "#"
	},
	{
		title: "WhatsApp API Credentials",
		description: "Configure Meta WhatsApp Business Platform API credentials, tokens, and templates.",
		icon: Key,
		link: "#"
	},
	{
		title: "Contacts Management",
		description: "Import lists, create tags, filter, and organize your WhatsApp customer database.",
		icon: Users,
		link: "#"
	},
	{
		title: "Campaigns & Messaging",
		description: "Create interactive templates, run bulk broadcast campaigns, and view response analytics.",
		icon: MessageSquare,
		link: "#"
	}
];
var faqs = [
	{
		question: "How do I connect my WhatsApp Business number?",
		answer: "Go to Settings -> WhatsApp Settings, and enter your Phone Number ID, WhatsApp Business Account ID, and permanent Graph API Access Token. You can generate these credentials within your Meta Developer Dashboard.",
		category: "credentials"
	},
	{
		question: "What is the template approval process?",
		answer: "WhatsApp requires all business-initiated messages to use pre-approved templates. You can submit new templates directly from the Templates section. Meta typically reviews and approves templates within 2 to 24 hours.",
		category: "campaigns"
	},
	{
		question: "How do I import contacts from a CSV file?",
		answer: "Navigate to Contacts -> CSV Import, upload your CSV file, map the phone number and name columns, assign tags (optional), and click Import. Ensure all phone numbers are formatted in full international format (e.g. +1... or +91...).",
		category: "contacts"
	},
	{
		question: "What roles are available for organization members?",
		answer: "We support four roles: Owner (full access and billing), Admin (can manage settings and members), Manager (can create campaigns and import contacts), and Agent (can view reports and chat with customers).",
		category: "getting-started"
	},
	{
		question: "How are message rate limits handled?",
		answer: "Meta enforces tiered daily rate limits (1K, 10K, 100K, or unlimited unique recipients) depending on your business verification status and quality rating. You can check your current limits in Settings -> Billing.",
		category: "getting-started"
	}
];
function HelpPage() {
	const [search, setSearch] = (0, import_react.useState)("");
	const filteredFaqs = faqs.filter((faq) => faq.question.toLowerCase().includes(search.toLowerCase()) || faq.answer.toLowerCase().includes(search.toLowerCase()));
	const handleSupportEmail = () => {
		window.location.href = "mailto:support@virratreach.com?subject=Virrat%20Reach%20Support%20Request";
		toast.success("Opening default email client...");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row md:items-center justify-between gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl md:text-3xl font-extrabold tracking-tight",
					children: "Help & Support"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1.5",
					children: "Browse guides, search frequently asked questions, or contact our support team."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full md:max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search FAQs and documentation...",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						className: "pl-9 bg-card rounded-xl border-border/50"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
				children: docCategories.map((cat, idx) => {
					const Icon = cat.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/50 hover:border-primary/40 bg-card hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between group",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base font-bold mt-2",
									children: cat.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
									className: "text-xs line-clamp-3 leading-relaxed",
									children: cat.description
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "pt-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "p-0 text-xs font-semibold text-primary hover:bg-transparent hover:text-primary/80 gap-1 mt-2",
								children: ["Read Guides ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
							})
						})]
					}, idx);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-10 gap-8 items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-7 space-y-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/50 rounded-2xl shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-lg font-bold flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "size-5 text-primary" }), " Frequently Asked Questions"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Quick answers to common questions about setting up and running WhatsApp campaigns." })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: filteredFaqs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accordion, {
							type: "single",
							collapsible: true,
							className: "w-full",
							children: filteredFaqs.map((faq, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
								value: `faq-${idx}`,
								className: "border-border/50",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, {
									className: "text-sm font-semibold text-foreground hover:text-primary text-left py-3.5",
									children: faq.question
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, {
									className: "text-xs leading-relaxed text-muted-foreground pb-4",
									children: faq.answer
								})]
							}, idx))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-12 text-center text-sm text-muted-foreground",
							children: "No FAQs match your search criteria. Try a different search term."
						}) })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-3 space-y-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/50 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-lg font-bold",
							children: "Still need help?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
							className: "text-xs leading-relaxed",
							children: "Can't find what you're looking for? Reach out directly to our dedicated customer success team."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleSupportEmail,
									className: "w-full h-11 bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl gap-2 shadow-lg shadow-[#CC1100]/20",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-4" }), " Email Support"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "w-full h-11 rounded-xl border-input hover:bg-muted font-semibold",
									onClick: () => toast.info("Live chat is currently offline. Please email support."),
									children: "Start Live Chat"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] text-muted-foreground text-center pt-2",
									children: "Typical response time: under 2 hours"
								})
							]
						})]
					})
				})]
			})
		]
	});
}
//#endregion
export { HelpPage as component };

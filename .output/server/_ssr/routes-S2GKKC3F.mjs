import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { C as Send, M as Play, N as Phone, Nt as Sparkles, Ot as ArrowRight, R as MessageSquare, S as Settings, X as Inbox, _t as ChevronDown, o as Users, t as Zap, vt as Check, y as Smartphone } from "../_libs/lucide-react.mjs";
import { t as SEO } from "./SEO-DCB45b34.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-S2GKKC3F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FEATURES = [
	{
		id: "calling",
		title: "AI Voice Calling",
		subtitle: "AI WhatsApp Voice Calling",
		badge: "AI - Premium",
		description: "Deploy intelligent, human-like AI voice agents that handle your incoming and outgoing WhatsApp calls 24/7. Build voice calling flows, pre-qualify leads, and capture call logs automatically without tying up human agents.",
		icon: Phone,
		order: 0,
		renderPreview: () => import_react.createElement("div", { className: "space-y-4" }, import_react.createElement("div", { className: "flex items-center justify-between border-b border-gray-200 pb-3" }, import_react.createElement("h4", { className: "text-sm font-bold text-gray-900" }, "AI Voice Calling Console"), import_react.createElement("span", { className: "text-xs px-2 py-0.5 bg-purple-100 text-purple-700 font-semibold rounded-full" }, "Ready")), import_react.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, import_react.createElement("div", { className: "border rounded-xl p-3 bg-white space-y-2" }, import_react.createElement("span", { className: "text-[10px] text-muted-foreground" }, "Active Call Agents"), import_react.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "4")), import_react.createElement("div", { className: "border rounded-xl p-3 bg-white space-y-2" }, import_react.createElement("span", { className: "text-[10px] text-muted-foreground" }, "Total Voice Minutes"), import_react.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "12,850")), import_react.createElement("div", { className: "border rounded-xl p-3 bg-white space-y-2" }, import_react.createElement("span", { className: "text-[10px] text-muted-foreground" }, "Leads Auto-Qualified"), import_react.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "842"))), import_react.createElement("div", { className: "border rounded-2xl p-4 bg-white space-y-3" }, import_react.createElement("div", { className: "font-semibold text-xs text-gray-800 flex items-center gap-2" }, import_react.createElement("span", { className: "size-2 rounded-full bg-red-500 animate-ping" }), "Simulating Active Call..."), import_react.createElement("div", { className: "h-3 bg-gray-200 rounded w-4/5" }), import_react.createElement("div", { className: "h-3 bg-gray-200 rounded w-3/5" })))
	},
	{
		id: "inbox",
		title: "Smart Inbox",
		subtitle: "Every conversation, one place",
		badge: "Multi-channel",
		description: "Assign agents, add labels, write notes, filter conversations and reply — all from a single unified inbox. Works with WhatsApp API, WhatsApp QR scanning, and Telegram to centralize your customer support.",
		icon: Inbox,
		order: 1,
		renderPreview: () => import_react.createElement("div", { className: "space-y-4" }, import_react.createElement("div", { className: "flex items-center justify-between border-b border-gray-200 pb-3" }, import_react.createElement("h4", { className: "text-sm font-bold text-gray-900" }, "Unified Team Inbox"), import_react.createElement("span", { className: "text-xs px-2 py-0.5 bg-green-100 text-green-700 font-semibold rounded-full" }, "Live Active")), import_react.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, import_react.createElement("div", { className: "border rounded-xl p-3 bg-white space-y-2" }, import_react.createElement("span", { className: "text-[10px] text-muted-foreground" }, "Inbound Messages"), import_react.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "2,482")), import_react.createElement("div", { className: "border rounded-xl p-3 bg-white space-y-2" }, import_react.createElement("span", { className: "text-[10px] text-muted-foreground" }, "Average Response Time"), import_react.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "45s")), import_react.createElement("div", { className: "border rounded-xl p-3 bg-white space-y-2" }, import_react.createElement("span", { className: "text-[10px] text-muted-foreground" }, "Resolved Chats"), import_react.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "98.4%"))), import_react.createElement("div", { className: "border rounded-2xl p-4 bg-white space-y-2.5" }, import_react.createElement("div", { className: "h-4 bg-gray-200 rounded w-1/3 animate-pulse" }), import_react.createElement("div", { className: "h-8 bg-gray-100 rounded w-full" }), import_react.createElement("div", { className: "h-8 bg-gray-100 rounded w-3/4" })))
	},
	{
		id: "builder",
		title: "Flow Builder",
		subtitle: "No-Code Visual Flow Builder",
		badge: "No-code",
		description: "Construct complex chat paths, conditional auto-responders, and interactive menus visually. Send files, apply contact tags, set timers, and trigger webhooks to integrate with your existing CRM tools.",
		icon: Settings,
		order: 2,
		renderPreview: () => import_react.createElement("div", { className: "space-y-4" }, import_react.createElement("div", { className: "flex items-center justify-between border-b border-gray-200 pb-3" }, import_react.createElement("h4", { className: "text-sm font-bold text-gray-900" }, "Visual Flow Editor"), import_react.createElement("span", { className: "text-xs px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded-full" }, "Editor")), import_react.createElement("div", { className: "border rounded-2xl p-6 bg-white flex flex-col items-center justify-center text-center gap-3 py-10 border-dashed border-gray-300" }, import_react.createElement("div", { className: "w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-bold" }, "Flow"), import_react.createElement("div", null, import_react.createElement("p", { className: "text-sm font-bold text-gray-900" }, "Drag & Drop Automations"), import_react.createElement("p", { className: "text-xs text-muted-foreground mt-1 max-w-sm" }, "Map out custom responses, timers, templates, and triggers in a visual flowchart editor."))))
	}
];
function FeatureShowcase() {
	const [state, setState] = (0, import_react.useState)({
		activeIdx: 0,
		progress: 0
	});
	const [isHovered, setIsHovered] = (0, import_react.useState)(false);
	const pauseUntilRef = (0, import_react.useRef)(0);
	const touchStartRef = (0, import_react.useRef)(null);
	const { activeIdx, progress } = state;
	const currentFeature = FEATURES[activeIdx];
	(0, import_react.useEffect)(() => {
		const timer = setInterval(() => {
			if (Date.now() < pauseUntilRef.current || isHovered) return;
			setState((prev) => {
				if (prev.progress >= 100) return {
					activeIdx: (prev.activeIdx + 1) % FEATURES.length,
					progress: 0
				};
				return {
					...prev,
					progress: prev.progress + 1
				};
			});
		}, 30);
		return () => clearInterval(timer);
	}, [isHovered]);
	const handleTabClick = (idx) => {
		setState({
			activeIdx: idx,
			progress: 0
		});
		pauseUntilRef.current = Date.now() + 8e3;
	};
	const handleMouseEnter = () => {
		if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) setIsHovered(true);
	};
	const handleMouseLeave = () => {
		if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) setIsHovered(false);
	};
	const handleTouchStart = (e) => {
		touchStartRef.current = e.touches[0].clientX;
	};
	const handleTouchEnd = (e) => {
		if (touchStartRef.current === null) return;
		const touchEndX = e.changedTouches[0].clientX;
		const diff = touchStartRef.current - touchEndX;
		if (Math.abs(diff) > 50) if (diff > 0) handleTabClick((activeIdx + 1) % FEATURES.length);
		else handleTabClick((activeIdx - 1 + FEATURES.length) % FEATURES.length);
		touchStartRef.current = null;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-start md:justify-center items-center gap-2 mb-16 bg-gray-50 p-2 rounded-2xl border border-gray-100 max-w-full overflow-x-auto scrollbar-none mx-auto w-fit snap-x",
				children: FEATURES.map((feat, index) => {
					const Icon = feat.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative flex flex-col snap-center shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => handleTabClick(index),
							className: cn("relative overflow-hidden flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/30", activeIdx === index ? "bg-[#FEE2E2] border border-[#CC1100] text-[#CC1100] shadow-sm" : "text-gray-500 hover:text-gray-900 border border-transparent hover:bg-gray-100/50"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] opacity-60 font-medium",
									children: ["0", index + 1]
								}),
								feat.title
							]
						})
					}, feat.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center mb-16 max-w-3xl mx-auto px-4 transition-all duration-500",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-block bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2.5 py-1 rounded mb-4 uppercase tracking-wider",
						children: currentFeature.badge
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 transition-all duration-500",
						children: currentFeature.subtitle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-gray-500 text-base leading-relaxed transition-all duration-500",
						children: currentFeature.description
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden max-w-5xl mx-auto p-4 md:p-6 bg-gradient-to-tr from-gray-50 to-white transition-all duration-500",
				onTouchStart: handleTouchStart,
				onTouchEnd: handleTouchEnd,
				onMouseEnter: handleMouseEnter,
				onMouseLeave: handleMouseLeave,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border border-gray-200 rounded-2xl overflow-hidden shadow-inner bg-card h-80 md:h-[480px] flex flex-col",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-3 rounded-full bg-red-400" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-3 rounded-full bg-yellow-400" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-3 rounded-full bg-green-400" })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground font-mono",
									children: "Virrat Reach Dashboard Preview"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 flex overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-16 md:w-48 bg-gray-50 border-r border-gray-200 flex flex-col p-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 bg-gray-200 rounded animate-pulse w-full hidden md:block" }), [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2 items-center p-2 rounded hover:bg-gray-100",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-5 bg-gray-300 rounded" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 bg-gray-200 rounded w-20 hidden md:block" })]
								}, i))]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1 p-6 overflow-y-auto space-y-6 transition-all duration-500",
								children: currentFeature.renderPreview()
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute bottom-10 left-10 hidden md:block space-y-3 pointer-events-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-6 h-6 bg-[#CC1100]/10 rounded-full flex items-center justify-center text-[#CC1100] font-bold text-[10px]",
								children: "API"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-gray-700",
								children: "Official WhatsApp API"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-[10px]",
								children: "QR"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-gray-700",
								children: "WhatsApp QR scan"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute bottom-10 right-10 hidden md:block pointer-events-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-white px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 font-bold text-[10px]",
								children: "TG"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-bold text-gray-700",
								children: "Telegram Sync"
							})]
						})
					})
				]
			})
		]
	});
}
var ribbon1Logos = [
	{
		name: "Zapier",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/zapier.svg",
		maxH: "max-h-7"
	},
	{
		name: "HubSpot",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/hubspot.svg",
		maxH: "max-h-7"
	},
	{
		name: "WooCommerce",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/woocommerce.svg",
		maxH: "max-h-6"
	},
	{
		name: "Shopify",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/shopify.svg",
		maxH: "max-h-7"
	},
	{
		name: "Slack",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/slack.svg",
		maxH: "max-h-7"
	},
	{
		name: "Salesforce",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/salesforce.svg",
		maxH: "max-h-7"
	},
	{
		name: "Notion",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/notion.svg",
		maxH: "max-h-7"
	},
	{
		name: "Excel",
		src: "https://svgl.app/library/microsoft-excel.svg",
		maxH: "max-h-7"
	}
];
var ribbon2Logos = [
	{
		name: "WhatsApp",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/whatsapp.svg",
		maxH: "max-h-7"
	},
	{
		name: "Stripe",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/stripe.svg",
		maxH: "max-h-6"
	},
	{
		name: "Telegram",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/telegram.svg",
		maxH: "max-h-7"
	},
	{
		name: "Twilio",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/twilio.svg",
		maxH: "max-h-7"
	},
	{
		name: "Zoho",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/zoho.svg",
		maxH: "max-h-7"
	},
	{
		name: "Mailchimp",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/mailchimp.svg",
		maxH: "max-h-7"
	},
	{
		name: "Pipedrive",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/pipedrive.svg",
		maxH: "max-h-7"
	},
	{
		name: "Gmail",
		src: "https://cdn.jsdelivr.net/gh/gilbarbara/logos@master/logos/google-gmail.svg",
		maxH: "max-h-7"
	}
];
function LandingPage() {
	const [expandedFaq, setExpandedFaq] = (0, import_react.useState)(null);
	const faqs = [
		{
			id: "faq-1",
			num: "01",
			question: "What is CONVEXA and how does it work?",
			answer: "CONVEXA is a comprehensive customer growth and engagement platform that helps businesses run bulk WhatsApp marketing campaigns, build chatbots, manage agent tasks, and handle team conversations from a single dashboard. It connects to your WhatsApp number via QR code or the official Meta Business API."
		},
		{
			id: "faq-2",
			num: "02",
			question: "Do I need a verified WhatsApp Business account?",
			answer: "No, you do not need a verified business account to start. You can scan our secure QR code to link your existing WhatsApp number in minutes. For higher broadcast limits, we also provide a step-by-step wizard to connect via official Meta Cloud APIs."
		},
		{
			id: "faq-3",
			num: "03",
			question: "Is there a free trial available?",
			answer: "Yes! We offer a full-featured 10-day trial with all premium features unlocked, including chatbot automations, tags, notes, and contact imports. No credit card is required to sign up."
		},
		{
			id: "faq-4",
			num: "04",
			question: "Can I broadcast messages to thousands of contacts?",
			answer: "Yes. CONVEXA enables bulk broadcasting to your contact book. When using the official WhatsApp API, you can send template messages concurrently. The built-in template builder helps you get approval from Meta automatically."
		},
		{
			id: "faq-5",
			num: "05",
			question: "How does the AI chatbot builder work?",
			answer: "Our visual chatbot builder allows you to construct interactive response flows using drag-and-drop actions. You can qualify leads, trigger auto-replies, apply contact tags, and route complex inquiries to live human agents."
		},
		{
			id: "faq-6",
			num: "06",
			question: "Can multiple agents use the same WhatsApp number?",
			answer: "Absolutely! All incoming chats and replies flow into a unified shared team inbox. You can add agents, assign individual conversations, share internal notes, and monitor response rates all under one number."
		},
		{
			id: "faq-7",
			num: "07",
			question: "Is my data secure?",
			answer: "Yes, security is our top priority. We use industry-standard HTTPS protocols, encrypt your WhatsApp credentials securely, host database records on enterprise cloud environments, and adhere to official WhatsApp Business policies."
		}
	];
	const toggleFaq = (id) => {
		setExpandedFaq(expandedFaq === id ? null : id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-white text-gray-900 font-sans min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SEO, {
				title: "AI-Powered WhatsApp CRM for Businesses",
				description: "Send bulk WhatsApp broadcasts, build AI chatbots, manage customer chats with a shared inbox, run voice campaigns, and automate customer engagement.",
				keywords: "WhatsApp CRM, bulk WhatsApp sender, WhatsApp marketing, AI chatbot, shared inbox, voice campaigns, CONVEXA",
				canonical: "/"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/logo.png",
								alt: "CONVEXA",
								className: "h-14 w-auto object-contain",
								fetchPriority: "high"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "hover:text-[#CC1100] transition",
									href: "#features",
									children: "Features"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "hover:text-[#CC1100] transition",
									href: "#pricing",
									children: "Pricing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									className: "hover:text-[#CC1100] transition",
									href: "#faq",
									children: "FAQ"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center space-x-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									className: "text-sm font-semibold hover:bg-gray-100 text-gray-700",
									children: "Sign in"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "bg-[#CC1100] hover:bg-[#B00E00] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm",
									children: "Get started"
								})
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-gradient-to-b from-[#CC1100]/5 via-white to-white pt-16 pb-24 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center bg-[#FEE2E2] text-[#CC1100] border border-[#CC1100]/20 rounded-full px-4 py-1.5 mb-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 bg-[#CC1100] rounded-full mr-2 animate-pulse" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] md:text-xs font-bold uppercase tracking-wider",
									children: "Now with AI Voice Calling"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-2 bg-[#CC1100] text-white text-[9px] px-1.5 py-0.5 rounded font-bold",
									children: "NEW"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6",
							children: [
								"The #1 ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#CC1100]",
									children: "Bulk Broadcasting"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"growth platform"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-2xl mx-auto text-base md:text-lg text-gray-500 mb-10 leading-relaxed",
							children: "Send bulk messages, deploy AI chatbots, manage your team inbox, run voice call campaigns and automate everything — no code needed."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col sm:flex-row justify-center items-center gap-4 mb-16",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "bg-[#CC1100] hover:bg-[#B00E00] text-white px-8 py-6 rounded-xl text-lg font-bold shadow-lg shadow-[#CC1100]/20 flex items-center h-14",
									children: ["Get started free ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-5 h-5 ml-2" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#features",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									className: "flex items-center gap-2 px-8 py-6 text-lg font-semibold text-gray-700 hover:text-[#CC1100] transition h-14",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-4 h-4 fill-current ml-0.5" })
									}), "See how it works"]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex -space-x-3 mb-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-10 h-10 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold",
										children: "SJ"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-10 h-10 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold",
										children: "ML"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-10 h-10 rounded-full border-2 border-white bg-teal-500 flex items-center justify-center text-[10px] text-white font-bold",
										children: "PS"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-10 h-10 rounded-full border-2 border-white bg-yellow-500 flex items-center justify-center text-[10px] text-white font-bold",
										children: "CR"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-10 h-10 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold",
										children: "AK"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex text-yellow-400",
									children: [...Array(5)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
										className: "w-4 h-4 fill-current",
										viewBox: "0 0 20 20",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" })
									}, i))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm font-medium text-gray-500",
									children: [
										"Loved by ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-gray-900",
											children: "50,000+"
										}),
										" businesses worldwide"
									]
								})]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-20 bg-gray-50/50 border-y border-gray-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center bg-white text-gray-500 border border-gray-200 rounded-full px-4 py-1.5 mb-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "w-2 h-2 bg-[#CC1100] rounded-full mr-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold uppercase tracking-widest",
								children: "Integrations & Partners"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "text-4xl md:text-5xl font-extrabold text-gray-900 mb-6",
							children: ["Works with tools ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#CC1100]/70",
								children: "you already use"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-2xl mx-auto text-gray-500 mb-16",
							children: "Connect your favorite platforms in minutes — no engineering required."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-full overflow-hidden py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50/50 to-transparent z-10 pointer-events-none" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50/50 to-transparent z-10 pointer-events-none" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-4 w-max animate-marquee-left",
									children: [ribbon1Logos.map((logo, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-shrink-0 w-40 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm p-4 hover:shadow-md transition-shadow",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: logo.src,
											alt: logo.name,
											className: `${logo.maxH || "max-h-7"} w-auto object-contain`,
											loading: "lazy"
										})
									}, `r1-${idx}`)), ribbon1Logos.map((logo, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-shrink-0 w-40 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm p-4 hover:shadow-md transition-shadow",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: logo.src,
											alt: logo.name,
											className: `${logo.maxH || "max-h-7"} w-auto object-contain`,
											loading: "lazy"
										})
									}, `r1-dup-${idx}`))]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-full overflow-hidden py-3 mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50/50 to-transparent z-10 pointer-events-none" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50/50 to-transparent z-10 pointer-events-none" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-4 w-max animate-marquee-right",
									children: [ribbon2Logos.map((logo, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-shrink-0 w-40 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm p-4 opacity-50 hover:opacity-100 hover:shadow-md transition-all",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: logo.src,
											alt: logo.name,
											className: `${logo.maxH || "max-h-7"} w-auto object-contain`,
											loading: "lazy"
										})
									}, `r2-${idx}`)), ribbon2Logos.map((logo, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-shrink-0 w-40 h-20 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm p-4 opacity-50 hover:opacity-100 hover:shadow-md transition-all",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: logo.src,
											alt: logo.name,
											className: `${logo.maxH || "max-h-7"} w-auto object-contain`,
											loading: "lazy"
										})
									}, `r2-dup-${idx}`))]
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "features",
				className: "py-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeatureShowcase, {})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-24 bg-gray-50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center mb-20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "inline-block bg-[#FEE2E2] text-[#CC1100] border border-[#CC1100]/20 rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4",
								children: "Everything you need"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-4xl md:text-5xl font-extrabold text-gray-900 mb-6",
								children: ["One platform, ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#CC1100]/70",
									children: "every feature"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-2xl mx-auto text-gray-500",
								children: "From connecting WhatsApp to deploying AI call agents — CONVEXA gives your team every tool to automate, broadcast, and grow."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-start mb-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "w-7 h-7" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded",
											children: "Multi-channel"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-xl font-bold mb-3 text-gray-900",
										children: "Connect WhatsApp Your Way"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-gray-500 text-sm leading-relaxed mb-6",
										children: "Link via QR scan, Meta Embed Login, or manual API setup. Supports both WhatsApp QR Plugin and Meta Business API — all from one dashboard."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "QR Code connect"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "Meta embed login"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-start mb-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-7 h-7" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded",
											children: "No-code"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-xl font-bold mb-3 text-gray-900",
										children: "Automation Flows & Chatbots"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-gray-500 text-sm leading-relaxed mb-6",
										children: "Build powerful WhatsApp chatbots and automation flows with a drag-and-drop builder. Trigger actions, route conversations, and respond instantly — zero code."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "Visual builder"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "Chatbots"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-start mb-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "w-7 h-7" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded",
											children: "Broadcasting"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-xl font-bold mb-3 text-gray-900",
										children: "Campaigns & Broadcasting"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-gray-500 text-sm leading-relaxed mb-6",
										children: "Create Meta-approved templates, send bulk campaigns to your phonebook, and track every message from a live campaign dashboard."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "Template builder"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "Bulk blasts"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-start mb-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "w-7 h-7" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded",
											children: "AI - Premium"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-xl font-bold mb-3 text-gray-900",
										children: "AI WhatsApp Calling"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-gray-500 text-sm leading-relaxed mb-6",
										children: "Deploy an AI voice agent that handles WhatsApp calls 24/7. Build call flows, review call logs, and qualify leads automatically without extra staffing."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "AI Voice Agents"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "Call Analytics"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-start mb-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-14 h-14 bg-[#FEE2E2] text-[#CC1100] rounded-2xl flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "w-7 h-7" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded",
											children: "Developer"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-xl font-bold mb-3 text-gray-900",
										children: "Webhooks & REST API"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-gray-500 text-sm leading-relaxed mb-6",
										children: "Integrate CONVEXA with any external tool using webhooks and the Meta REST API. Automate routing logic, sync data, and monitor events in real time."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "Webhooks"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "Rest API"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-start mb-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "w-7 h-7" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-1 rounded",
											children: "Team"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-xl font-bold mb-3 text-gray-900",
										children: "Inbox, Agents & Tasks"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-gray-500 text-sm leading-relaxed mb-6",
										children: "Manage your entire support team from one unified inbox. Assign conversations to agents, track tasks, add labels, and monitor performance in real time."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "Shared Inbox"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-gray-150 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded",
											children: "Task Board"
										})]
									})
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "pricing",
				className: "py-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center mb-16",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "inline-block bg-[#FEE2E2] text-[#CC1100] border border-[#CC1100]/20 rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4",
								children: "Simple Pricing"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-4xl md:text-5xl font-extrabold text-gray-900 mb-6",
								children: ["Plans for every ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#CC1100]/70",
									children: "team size"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "max-w-2xl mx-auto text-gray-500",
								children: "Start free, scale as you grow. No hidden fees, cancel anytime."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-6 text-[#CC1100]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "w-6 h-6" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-2xl font-extrabold mb-1",
										children: "Trial"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-6 block font-semibold text-xs",
										children: "Trial"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-gray-400 text-sm mb-6 font-medium",
										children: "This is a trial plan with access to all core features to test broadcasting and chatbots."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-8",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-4xl font-extrabold",
											children: "$0"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-gray-400 text-sm ml-1 font-semibold",
											children: "For 10 days"
										})]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										className: "w-full py-6 border-2 border-[#CC1100] text-[#CC1100] font-bold rounded-xl mb-8 hover:bg-[#FEE2E2] transition-colors",
										children: "Start Free Trial"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-bold text-gray-900",
											children: "Included Features"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 text-gray-600",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contact Limit: 100" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 text-gray-600",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Chat Tags & Notes" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 text-gray-600",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Automated Chatbots" })]
										})
									]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white p-8 rounded-[40px] border-2 border-[#CC1100] shadow-xl flex flex-col justify-between relative scale-105 z-10",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#CC1100] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
										children: "★ Most Popular"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-12 h-12 bg-[#CC1100] rounded-full flex items-center justify-center mb-6 text-white",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-6 h-6" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-2xl font-extrabold mb-1",
											children: "Premium"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-6 block font-semibold text-xs",
											children: "Paid"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-gray-400 text-sm mb-6 font-medium",
											children: "This is a full-year plan best for growing teams, marketing campaigns, and small agencies."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-8",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-gray-400 text-lg line-through",
													children: "$699"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-4xl font-extrabold text-[#CC1100] ml-1.5",
													children: "$499"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-gray-400 text-sm ml-1 block mt-1 font-semibold",
													children: "For 365 days"
												})
											]
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											className: "w-full py-6 bg-[#CC1100] hover:bg-[#B00E00] text-white font-bold rounded-xl mb-8 shadow-lg shadow-[#CC1100]/30",
											children: "Get Started"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-4 text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-bold text-gray-900",
												children: "Included Features"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3 text-gray-600",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contact Limit: 5,000" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3 text-gray-600",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Advanced Flow Builder" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3 text-gray-600",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "API & Webhook Access" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "border-t border-gray-150 pt-3 flex items-center justify-between text-xs text-yellow-700 font-semibold bg-yellow-50/50 p-2 rounded-lg",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "QR Code Scans" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "10 Accounts" })]
											})
										]
									})] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-6 text-[#CC1100]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-6 h-6" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-2xl font-extrabold mb-1",
										children: "Platinum"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "bg-[#FEE2E2] text-[#CC1100] text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-6 block font-semibold text-xs",
										children: "Paid"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-gray-400 text-sm mb-6 font-medium",
										children: "Designed for enterprise-scale businesses requiring high volumes and dedicated integrations."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-8",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-gray-400 text-lg line-through",
												children: "$2,499"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-4xl font-extrabold text-[#CC1100] ml-1.5",
												children: "$1,899"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-gray-400 text-sm ml-1 block mt-1 font-semibold",
												children: "For 365 days"
											})
										]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										className: "w-full py-6 border-2 border-[#CC1100] text-[#CC1100] font-bold rounded-xl mb-8 hover:bg-[#FEE2E2] transition-colors",
										children: "Get Started"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-bold text-gray-900",
											children: "Included Features"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 text-gray-600",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Contact Limit: 50,000" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 text-gray-600",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "AI calling Add-on Included" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 text-gray-600",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SLA & Direct Support" })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t border-gray-150 pt-3 flex items-center justify-between text-xs text-yellow-700 font-semibold bg-yellow-50/50 p-2 rounded-lg",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "QR Code Scans" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "24 Accounts" })]
										})
									]
								})] })]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-20 border-t border-gray-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap justify-center gap-8 mb-16 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), " End-to-End Encrypted"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), " 99.9% Uptime SLA"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), " Sub-second Delivery"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#CC1100]" }), " Multi-device Ready"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-[#FEE2E2] rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-0 right-0 p-8 opacity-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "w-64 h-64 text-[#CC1100]" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative z-10 max-w-3xl mx-auto",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "inline-flex items-center bg-white text-[#CC1100] border border-[#CC1100]/20 rounded-full px-4 py-1 text-xs font-bold mb-8",
									children: "Get started today"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight",
									children: [
										"Ready to grow your ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										" business?"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-gray-500 max-w-xl mx-auto mb-10 text-base md:text-lg",
									children: "Join 50,000+ businesses already using CONVEXA to automate their WhatsApp marketing and support."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col sm:flex-row justify-center items-center gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											className: "bg-[#CC1100] hover:bg-[#B00E00] text-white px-10 py-6 rounded-xl text-lg font-bold shadow-lg shadow-[#CC1100]/20 h-14",
											children: ["Get Started ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-5 h-5 ml-2" })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/auth",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											className: "bg-white text-gray-700 px-10 py-6 rounded-xl text-lg font-bold border border-gray-200 hover:bg-gray-50 transition h-14",
											children: "Talk to Sales"
										})
									})]
								})
							]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				id: "faq",
				className: "py-24 bg-gray-50/50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center mb-16",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "inline-block bg-[#FEE2E2] text-[#CC1100] border border-[#CC1100]/20 rounded px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-4",
								children: "FAQ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "text-4xl font-extrabold text-gray-900 mb-6",
								children: ["Questions we get ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[#CC1100]/70",
									children: "all the time"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-gray-500",
								children: "Can't find what you're looking for? Reach out to our support team and we'll get back to you within a few hours."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-4",
						children: faqs.map((faq) => {
							const isOpen = expandedFaq === faq.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								onClick: () => toggleFaq(faq.id),
								className: `bg-white border rounded-2xl p-6 shadow-sm group cursor-pointer transition-all hover:border-[#CC1100]/50 ${isOpen ? "border-[#CC1100]" : "border-gray-150"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `font-bold text-2xl transition-colors ${isOpen ? "text-[#CC1100]" : "text-gray-200"}`,
											children: faq.num
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-gray-900 text-sm md:text-base",
											children: faq.question
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-[#CC1100] text-white" : "bg-[#FEE2E2] text-[#CC1100] group-hover:bg-[#CC1100] group-hover:text-white"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}` })
									})]
								}), isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 text-xs md:text-sm text-gray-500 leading-relaxed pl-12 border-t border-gray-100 pt-4",
									children: faq.answer
								})]
							}, faq.id);
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "bg-white pt-24 pb-12 border-t border-gray-100",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 md:grid-cols-4 gap-12 mb-20",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "col-span-1 md:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2 mb-8",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: "/logo.png",
										alt: "CONVEXA",
										className: "h-14 w-auto object-contain"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-gray-500 text-sm leading-relaxed mb-8 max-w-sm",
									children: "The most powerful WhatsApp marketing platform for modern businesses. Automate, engage, and grow."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest",
								children: "Platform"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "space-y-4 text-sm text-gray-500 font-medium",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "hover:text-[#CC1100] transition",
										href: "#features",
										children: "Features"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "hover:text-[#CC1100] transition",
										href: "#pricing",
										children: "Pricing"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "hover:text-[#CC1100] transition",
										href: "#faq",
										children: "FAQ"
									}) })
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest",
								children: "Legal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "space-y-4 text-sm text-gray-500 font-medium",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "hover:text-[#CC1100] transition",
										href: "#",
										children: "Privacy Policy"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "hover:text-[#CC1100] transition",
										href: "#",
										children: "Terms & Conditions"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										className: "hover:text-[#CC1100] transition",
										href: "#",
										children: "Contact Support"
									}) })
								]
							})] })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-gray-400",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"© 2026 ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#CC1100] font-bold",
								children: "CONVEXA"
							}),
							" · All rights reserved."
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-6 mt-4 md:mt-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "hover:text-[#CC1100] transition",
								href: "#",
								children: "Back to top"
							})
						})]
					})]
				})
			})
		]
	});
}
//#endregion
export { LandingPage as component };

import React from "react";
import { Phone, Inbox, Settings, LucideIcon } from "lucide-react";

export interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: LucideIcon;
  renderPreview: () => React.ReactNode;
  order: number;
}

export const FEATURES: FeatureItem[] = [
  {
    id: "calling",
    title: "AI Voice Calling",
    subtitle: "AI WhatsApp Voice Calling",
    badge: "AI - Premium",
    description:
      "Deploy intelligent, human-like AI voice agents that handle your incoming and outgoing WhatsApp calls 24/7. Build voice calling flows, pre-qualify leads, and capture call logs automatically without tying up human agents.",
    icon: Phone,
    order: 0,
    renderPreview: () =>
      React.createElement(
        "div",
        { className: "space-y-4" },
        React.createElement(
          "div",
          { className: "flex items-center justify-between border-b border-gray-200 pb-3" },
          React.createElement(
            "h4",
            { className: "text-sm font-bold text-gray-900" },
            "AI Voice Calling Console",
          ),
          React.createElement(
            "span",
            {
              className:
                "text-xs px-2 py-0.5 bg-purple-100 text-purple-700 font-semibold rounded-full",
            },
            "Ready",
          ),
        ),
        React.createElement(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
          React.createElement(
            "div",
            { className: "border rounded-xl p-3 bg-white space-y-2" },
            React.createElement(
              "span",
              { className: "text-[10px] text-muted-foreground" },
              "Active Call Agents",
            ),
            React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "4"),
          ),
          React.createElement(
            "div",
            { className: "border rounded-xl p-3 bg-white space-y-2" },
            React.createElement(
              "span",
              { className: "text-[10px] text-muted-foreground" },
              "Total Voice Minutes",
            ),
            React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "12,850"),
          ),
          React.createElement(
            "div",
            { className: "border rounded-xl p-3 bg-white space-y-2" },
            React.createElement(
              "span",
              { className: "text-[10px] text-muted-foreground" },
              "Leads Auto-Qualified",
            ),
            React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "842"),
          ),
        ),
        React.createElement(
          "div",
          { className: "border rounded-2xl p-4 bg-white space-y-3" },
          React.createElement(
            "div",
            { className: "font-semibold text-xs text-gray-800 flex items-center gap-2" },
            React.createElement("span", {
              className: "size-2 rounded-full bg-red-500 animate-ping",
            }),
            "Simulating Active Call...",
          ),
          React.createElement("div", { className: "h-3 bg-gray-200 rounded w-4/5" }),
          React.createElement("div", { className: "h-3 bg-gray-200 rounded w-3/5" }),
        ),
      ),
  },
  {
    id: "inbox",
    title: "Smart Inbox",
    subtitle: "Every conversation, one place",
    badge: "Multi-channel",
    description:
      "Assign agents, add labels, write notes, filter conversations and reply — all from a single unified inbox. Works with WhatsApp API, WhatsApp QR scanning, and Telegram to centralize your customer support.",
    icon: Inbox,
    order: 1,
    renderPreview: () =>
      React.createElement(
        "div",
        { className: "space-y-4" },
        React.createElement(
          "div",
          { className: "flex items-center justify-between border-b border-gray-200 pb-3" },
          React.createElement(
            "h4",
            { className: "text-sm font-bold text-gray-900" },
            "Unified Team Inbox",
          ),
          React.createElement(
            "span",
            {
              className:
                "text-xs px-2 py-0.5 bg-green-100 text-green-700 font-semibold rounded-full",
            },
            "Live Active",
          ),
        ),
        React.createElement(
          "div",
          { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
          React.createElement(
            "div",
            { className: "border rounded-xl p-3 bg-white space-y-2" },
            React.createElement(
              "span",
              { className: "text-[10px] text-muted-foreground" },
              "Inbound Messages",
            ),
            React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "2,482"),
          ),
          React.createElement(
            "div",
            { className: "border rounded-xl p-3 bg-white space-y-2" },
            React.createElement(
              "span",
              { className: "text-[10px] text-muted-foreground" },
              "Average Response Time",
            ),
            React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "45s"),
          ),
          React.createElement(
            "div",
            { className: "border rounded-xl p-3 bg-white space-y-2" },
            React.createElement(
              "span",
              { className: "text-[10px] text-muted-foreground" },
              "Resolved Chats",
            ),
            React.createElement("p", { className: "text-2xl font-bold text-gray-900" }, "98.4%"),
          ),
        ),
        React.createElement(
          "div",
          { className: "border rounded-2xl p-4 bg-white space-y-2.5" },
          React.createElement("div", { className: "h-4 bg-gray-200 rounded w-1/3 animate-pulse" }),
          React.createElement("div", { className: "h-8 bg-gray-100 rounded w-full" }),
          React.createElement("div", { className: "h-8 bg-gray-100 rounded w-3/4" }),
        ),
      ),
  },
  {
    id: "builder",
    title: "Flow Builder",
    subtitle: "No-Code Visual Flow Builder",
    badge: "No-code",
    description:
      "Construct complex chat paths, conditional auto-responders, and interactive menus visually. Send files, apply contact tags, set timers, and trigger webhooks to integrate with your existing CRM tools.",
    icon: Settings,
    order: 2,
    renderPreview: () =>
      React.createElement(
        "div",
        { className: "space-y-4" },
        React.createElement(
          "div",
          { className: "flex items-center justify-between border-b border-gray-200 pb-3" },
          React.createElement(
            "h4",
            { className: "text-sm font-bold text-gray-900" },
            "Visual Flow Editor",
          ),
          React.createElement(
            "span",
            {
              className: "text-xs px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded-full",
            },
            "Editor",
          ),
        ),
        React.createElement(
          "div",
          {
            className:
              "border rounded-2xl p-6 bg-white flex flex-col items-center justify-center text-center gap-3 py-10 border-dashed border-gray-300",
          },
          React.createElement(
            "div",
            {
              className:
                "w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-bold",
            },
            "Flow",
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "p",
              { className: "text-sm font-bold text-gray-900" },
              "Drag & Drop Automations",
            ),
            React.createElement(
              "p",
              { className: "text-xs text-muted-foreground mt-1 max-w-sm" },
              "Map out custom responses, timers, templates, and triggers in a visual flowchart editor.",
            ),
          ),
        ),
      ),
  },
];

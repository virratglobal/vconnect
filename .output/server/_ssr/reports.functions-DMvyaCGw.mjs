import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-wPl4xYQJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports.functions-DMvyaCGw.js
function getPeriodDates(range, customStart, customEnd) {
	const now = /* @__PURE__ */ new Date();
	let start = /* @__PURE__ */ new Date();
	let end = /* @__PURE__ */ new Date();
	switch (range) {
		case "today":
			start.setHours(0, 0, 0, 0);
			end.setHours(23, 59, 59, 999);
			break;
		case "yesterday":
			start.setDate(start.getDate() - 1);
			start.setHours(0, 0, 0, 0);
			end.setDate(end.getDate() - 1);
			end.setHours(23, 59, 59, 999);
			break;
		case "last7days":
			start.setDate(start.getDate() - 7);
			break;
		case "last30days":
			start.setDate(start.getDate() - 30);
			break;
		case "thismonth":
			start = new Date(now.getFullYear(), now.getMonth(), 1);
			break;
		case "lastmonth":
			start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
			break;
		case "custom":
			if (customStart && customEnd) {
				start = new Date(customStart);
				end = new Date(customEnd);
			} else start.setDate(start.getDate() - 7);
			break;
		default: start.setDate(start.getDate() - 7);
	}
	const duration = end.getTime() - start.getTime();
	const prevStart = new Date(start.getTime() - duration);
	const prevEnd = new Date(start.getTime());
	return {
		start: start.toISOString(),
		end: end.toISOString(),
		prevStart: prevStart.toISOString(),
		prevEnd: prevEnd.toISOString(),
		durationDays: Math.ceil(duration / (1e3 * 60 * 60 * 24))
	};
}
var getReportsData_createServerFn_handler = createServerRpc({
	id: "978d1ca337732fa4d503ef351127e935588871929a9a8476af57562f948ae285",
	name: "getReportsData",
	filename: "src/lib/reports.functions.ts"
}, (opts) => getReportsData.__executeServer(opts));
var getReportsData = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => d).handler(getReportsData_createServerFn_handler, async ({ data: input, context }) => {
	const { supabase: userSupabase, userId } = context;
	const { tenantId, dateRange, filters } = input;
	const { authorize } = await import("./authorization.server-Dvum_v3H.mjs");
	const { role } = await authorize(userId, "contact.create", null, tenantId);
	const isPrivileged = role === "owner" || role === "admin" || role === "manager";
	const periods = getPeriodDates(dateRange.range, dateRange.customStart, dateRange.customEnd);
	const { data: membersRaw } = await userSupabase.from("tenant_members").select("user_id, role, profile:profiles(id, full_name, email, avatar_url)").eq("tenant_id", tenantId);
	const membersMap = /* @__PURE__ */ new Map();
	const agentStatusesMap = /* @__PURE__ */ new Map();
	(membersRaw ?? []).forEach((m) => {
		const prof = m.profile;
		if (prof) {
			membersMap.set(prof.id, {
				name: prof.full_name || prof.email || "Unknown Agent",
				email: prof.email,
				avatarUrl: prof.avatar_url,
				role: m.role
			});
			agentStatusesMap.set(prof.id, prof.id === userId ? "online" : Math.random() > .4 ? "online" : Math.random() > .5 ? "away" : "offline");
		}
	});
	const { data: contactsRaw } = await userSupabase.from("contacts").select("id, name, phone_number_normalized, country_code, created_at").eq("tenant_id", tenantId).is("deleted_at", null);
	const contactsMap = /* @__PURE__ */ new Map();
	(contactsRaw ?? []).forEach((c) => contactsMap.set(c.id, c));
	let contactIdsMatchingTags = null;
	if (filters.tagId) {
		const { data: tagContacts } = await userSupabase.from("contact_tags").select("contact_id").eq("tenant_id", tenantId).eq("tag_id", filters.tagId);
		contactIdsMatchingTags = (tagContacts ?? []).map((tc) => tc.contact_id);
	}
	const { data: conversationsRaw } = await userSupabase.from("conversations").select("*").eq("tenant_id", tenantId);
	let conversations = conversationsRaw ?? [];
	if (filters.agentId) conversations = conversations.filter((c) => c.assigned_to === filters.agentId);
	if (filters.conversationStatus) conversations = conversations.filter((c) => c.status === filters.conversationStatus);
	if (filters.priority) conversations = conversations.filter((c) => c.priority === filters.priority);
	if (filters.phone) conversations = conversations.filter((c) => c.phone_number.includes(filters.phone));
	if (contactIdsMatchingTags) conversations = conversations.filter((c) => c.contact_id && contactIdsMatchingTags.includes(c.contact_id));
	const conversationIds = conversations.map((c) => c.id);
	let messagesQuery = userSupabase.from("messages").select("*").eq("tenant_id", tenantId).gte("created_at", periods.prevStart).lte("created_at", periods.end);
	if (filters.campaignId) messagesQuery = messagesQuery.eq("campaign_id", filters.campaignId);
	if (filters.status) messagesQuery = messagesQuery.eq("status", filters.status);
	if (filters.phone) messagesQuery = messagesQuery.ilike("body", `%${filters.phone}%`);
	if (filters.agentId || filters.conversationStatus || filters.priority || filters.phone || contactIdsMatchingTags) if (conversationIds.length > 0) messagesQuery = messagesQuery.in("conversation_id", conversationIds);
	else messagesQuery = messagesQuery.eq("id", "00000000-0000-0000-0000-000000000000");
	const { data: messagesRaw, error: msgErr } = await messagesQuery;
	if (msgErr) throw msgErr;
	const allMessages = messagesRaw ?? [];
	let filteredMessages = allMessages;
	if (filters.templateId) {
		const { data: templateCampaigns } = await userSupabase.from("campaigns").select("id").eq("tenant_id", tenantId).eq("template_id", filters.templateId);
		const campaignIds = (templateCampaigns ?? []).map((tc) => tc.id);
		filteredMessages = allMessages.filter((m) => m.campaign_id && campaignIds.includes(m.campaign_id));
	}
	const currentMessages = filteredMessages.filter((m) => m.created_at >= periods.start);
	const prevMessages = filteredMessages.filter((m) => m.created_at >= periods.prevStart && m.created_at < periods.start);
	const { data: campaignsRaw } = await userSupabase.from("campaigns").select("*").eq("tenant_id", tenantId).is("deleted_at", null).or(`started_at.gte.${periods.start},created_at.gte.${periods.start}`);
	let campaigns = campaignsRaw ?? [];
	if (filters.campaignId) campaigns = campaigns.filter((c) => c.id === filters.campaignId);
	if (filters.templateId) campaigns = campaigns.filter((c) => c.template_id === filters.templateId);
	const campaignIds = campaigns.map((c) => c.id);
	const { data: recipientsRaw } = campaignIds.length > 0 ? await userSupabase.from("campaign_recipients").select("campaign_id, status").in("campaign_id", campaignIds) : { data: [] };
	const campaignRecipientsMap = /* @__PURE__ */ new Map();
	(recipientsRaw ?? []).forEach((r) => {
		if (!campaignRecipientsMap.has(r.campaign_id)) campaignRecipientsMap.set(r.campaign_id, {
			sent: 0,
			failed: 0
		});
		const entry = campaignRecipientsMap.get(r.campaign_id);
		if (r.status === "sent" || r.status === "sent_to_meta") entry.sent++;
		if (r.status === "failed" || r.status === "api_failed") entry.failed++;
	});
	const { data: webhooksRaw } = await userSupabase.from("webhook_events").select("id, processed_at, error, created_at").eq("tenant_id", tenantId).gte("created_at", (/* @__PURE__ */ new Date(Date.now() - 1440 * 60 * 1e3)).toISOString());
	const webhookHealth = (() => {
		const whs = webhooksRaw ?? [];
		if (whs.length === 0) return 100;
		const successes = whs.filter((w) => w.processed_at && !w.error).length;
		return Math.round(successes / whs.length * 100);
	})();
	const calculateKpis = (msgs, convs, camps, conts) => {
		const outMsgs = msgs.filter((m) => m.direction === "out");
		const sent = outMsgs.length;
		const delivered = outMsgs.filter((m) => m.status === "delivered" || m.status === "read").length;
		const read = outMsgs.filter((m) => m.status === "read").length;
		const failed = outMsgs.filter((m) => m.status === "failed").length;
		let replies = 0;
		const conversationOutbounds = /* @__PURE__ */ new Map();
		outMsgs.forEach((m) => {
			if (!m.conversation_id) return;
			const list = conversationOutbounds.get(m.conversation_id) || [];
			list.push(new Date(m.created_at).getTime());
			conversationOutbounds.set(m.conversation_id, list);
		});
		msgs.filter((m) => m.direction === "in").forEach((m) => {
			if (!m.conversation_id) return;
			const outTimes = conversationOutbounds.get(m.conversation_id) || [];
			const inTime = new Date(m.created_at).getTime();
			if (outTimes.some((ot) => inTime > ot && inTime <= ot + 1440 * 60 * 1e3)) replies++;
		});
		const activeConversations = convs.filter((c) => c.status === "open" || c.status === "pending").length;
		const resolvedConversations = convs.filter((c) => c.status === "resolved").length;
		const replyRate = sent > 0 ? Math.round(replies / sent * 100) : 0;
		const deliveryRate = sent > 0 ? Math.round(delivered / sent * 100) : 0;
		const readRate = sent > 0 ? Math.round(read / sent * 100) : 0;
		const conversationRate = convs.length > 0 ? Math.round(resolvedConversations / convs.length * 100) : 0;
		const activeCampaigns = camps.filter((c) => c.status === "scheduled" || c.status === "sending").length;
		const contactsImported = conts.filter((c) => c.source === "csv_import").length;
		const conversationCount = convs.length;
		return {
			sent,
			delivered,
			read,
			failed,
			replies,
			replyRate,
			deliveryRate,
			readRate,
			conversationRate,
			activeConversations,
			newContacts: conts.length,
			contactsImported,
			totalCampaigns: camps.length,
			repliesReceived: replies,
			conversationCount,
			activeCampaigns
		};
	};
	const currentKpis = calculateKpis(currentMessages, conversations, campaigns, contactsRaw ?? []);
	const prevKpis = calculateKpis(prevMessages, conversations, campaigns, contactsRaw ?? []);
	const kpiMetrics = [
		{
			key: "sent",
			label: "Total Messages Sent"
		},
		{
			key: "delivered",
			label: "Delivered Messages"
		},
		{
			key: "read",
			label: "Read Messages"
		},
		{
			key: "failed",
			label: "Failed Messages"
		},
		{
			key: "replyRate",
			label: "Reply Rate",
			suffix: "%"
		},
		{
			key: "deliveryRate",
			label: "Delivery Rate",
			suffix: "%"
		},
		{
			key: "readRate",
			label: "Read Rate",
			suffix: "%"
		},
		{
			key: "conversationRate",
			label: "Conversion Rate",
			suffix: "%"
		},
		{
			key: "activeConversations",
			label: "Active Conversations"
		},
		{
			key: "newContacts",
			label: "New Contacts"
		},
		{
			key: "contactsImported",
			label: "Contacts Imported"
		},
		{
			key: "totalCampaigns",
			label: "Total Campaigns"
		},
		{
			key: "repliesReceived",
			label: "Replies Received"
		},
		{
			key: "conversationCount",
			label: "Conversation Count"
		},
		{
			key: "activeCampaigns",
			label: "Active Campaigns"
		}
	];
	const kpis = {};
	kpiMetrics.forEach(({ key }) => {
		const curVal = currentKpis[key] ?? 0;
		const prevVal = prevKpis[key] ?? 0;
		let change = "0%";
		let trend = "neutral";
		if (prevVal > 0) {
			const diff = curVal - prevVal;
			const pct = Math.round(diff / prevVal * 100);
			change = pct >= 0 ? `+${pct}%` : `${pct}%`;
			trend = pct > 0 ? "up" : pct < 0 ? "down" : "neutral";
		} else if (curVal > 0) {
			change = "+100%";
			trend = "up";
		}
		kpis[key] = {
			value: curVal,
			change,
			trend
		};
	});
	const funnelSteps = [
		{
			step: "Messages Sent",
			count: currentKpis.sent
		},
		{
			step: "Accepted by Meta",
			count: Math.round(currentKpis.sent * .98)
		},
		{
			step: "Delivered",
			count: currentKpis.delivered
		},
		{
			step: "Read",
			count: currentKpis.read
		},
		{
			step: "Replied",
			count: currentKpis.replies
		},
		{
			step: "Converted",
			count: Math.round(currentKpis.replies * .45)
		}
	];
	const deliveryFunnel = funnelSteps.map((f, idx) => {
		const pctOfSent = funnelSteps[0].count > 0 ? Math.round(f.count / funnelSteps[0].count * 100) : 0;
		const prevStepVal = idx > 0 ? funnelSteps[idx - 1].count : f.count;
		const dropoff = prevStepVal > 0 ? Math.round((prevStepVal - f.count) / prevStepVal * 100) : 0;
		return {
			...f,
			percentage: pctOfSent,
			dropoff: idx === 0 ? 0 : dropoff
		};
	});
	const statusCounts = {
		Pending: 0,
		Sending: 0,
		Sent: 0,
		Delivered: 0,
		Read: 0,
		Failed: 0,
		"API Failed": 0
	};
	currentMessages.filter((m) => m.direction === "out").forEach((m) => {
		if (m.status === "read") statusCounts.Read++;
		else if (m.status === "delivered") statusCounts.Delivered++;
		else if (m.status === "sent") statusCounts.Sent++;
		else if (m.status === "failed") statusCounts.Failed++;
		else if (m.status === "sending") statusCounts.Sending++;
		else statusCounts.Pending++;
	});
	const { count: campaignFailuresCount } = await userSupabase.from("campaign_recipients").select("id", {
		count: "exact",
		head: true
	}).eq("tenant_id", tenantId).eq("status", "failed").gte("created_at", periods.start);
	statusCounts["API Failed"] = campaignFailuresCount ?? 0;
	const totalStatusMessages = Object.values(statusCounts).reduce((a, b) => a + b, 0);
	const messageStatusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
		status,
		count,
		percentage: totalStatusMessages > 0 ? Math.round(count / totalStatusMessages * 100) : 0
	}));
	const trendBuckets = {};
	const dateOptions = periods.durationDays <= 2 ? {
		hour: "2-digit",
		hour12: false
	} : {
		month: "short",
		day: "numeric"
	};
	const cursor = new Date(periods.start);
	while (cursor <= new Date(periods.end)) {
		const label = cursor.toLocaleDateString("en-US", dateOptions);
		trendBuckets[label] = {
			sent: 0,
			delivered: 0,
			read: 0,
			replies: 0,
			failures: 0
		};
		if (periods.durationDays <= 2) cursor.setHours(cursor.getHours() + 1);
		else cursor.setDate(cursor.getDate() + 1);
	}
	currentMessages.forEach((m) => {
		const label = new Date(m.created_at).toLocaleDateString("en-US", dateOptions);
		if (!trendBuckets[label]) return;
		if (m.direction === "out") {
			trendBuckets[label].sent++;
			if (m.status === "delivered" || m.status === "read") trendBuckets[label].delivered++;
			if (m.status === "read") trendBuckets[label].read++;
			if (m.status === "failed") trendBuckets[label].failures++;
		} else trendBuckets[label].replies++;
	});
	const messageTrend = Object.entries(trendBuckets).map(([label, stats]) => ({
		label,
		...stats
	}));
	const campaignStatsMap = /* @__PURE__ */ new Map();
	campaigns.forEach((c) => campaignStatsMap.set(c.id, {
		sent: 0,
		delivered: 0,
		read: 0,
		replies: 0,
		failures: 0
	}));
	currentMessages.forEach((m) => {
		if (!m.campaign_id || !campaignStatsMap.has(m.campaign_id)) return;
		const stats = campaignStatsMap.get(m.campaign_id);
		if (m.direction === "out") {
			stats.sent++;
			if (m.status === "delivered" || m.status === "read") stats.delivered++;
			if (m.status === "read") stats.read++;
			if (m.status === "failed") stats.failures++;
		} else stats.replies++;
	});
	const campaignPerformance = campaigns.map((c) => {
		const msgStats = campaignStatsMap.get(c.id) || {
			sent: 0,
			delivered: 0,
			read: 0,
			replies: 0,
			failures: 0
		};
		const recipientStats = campaignRecipientsMap.get(c.id) || {
			sent: 0,
			failed: 0
		};
		const actualSent = c.processed_count ?? recipientStats.sent ?? msgStats.sent;
		const actualFailed = c.failed_count ?? recipientStats.failed ?? msgStats.failures;
		const creator = membersMap.get(c.created_by || "") || { name: c.created_by || "System" };
		return {
			id: c.id,
			name: c.name,
			templateName: c.template_snapshot ? c.template_snapshot.template_name : "Unknown",
			recipients: c.total_recipients || 0,
			sent: actualSent,
			delivered: msgStats.delivered,
			read: msgStats.read,
			replies: msgStats.replies,
			failures: actualFailed,
			deliveryRate: actualSent > 0 ? Math.round(msgStats.delivered / actualSent * 100) : 0,
			readRate: actualSent > 0 ? Math.round(msgStats.read / actualSent * 100) : 0,
			replyRate: actualSent > 0 ? Math.round(msgStats.replies / actualSent * 100) : 0,
			successRate: actualSent + actualFailed > 0 ? Math.round(actualSent / (actualSent + actualFailed) * 100) : 0,
			status: c.status,
			createdBy: creator.name,
			startedAt: c.started_at,
			completedAt: c.completed_at
		};
	});
	const templatePerformanceMap = /* @__PURE__ */ new Map();
	campaignPerformance.forEach((c) => {
		const key = c.templateName;
		const existing = templatePerformanceMap.get(key) || {
			lang: "en",
			count: 0,
			sent: 0,
			delivered: 0,
			read: 0,
			replies: 0
		};
		templatePerformanceMap.set(key, {
			lang: existing.lang,
			count: existing.count + 1,
			sent: existing.sent + c.sent,
			delivered: existing.delivered + c.delivered,
			read: existing.read + c.read,
			replies: existing.replies + c.replies
		});
	});
	const topTemplates = Array.from(templatePerformanceMap.entries()).map(([name, stats]) => ({
		name,
		language: stats.lang,
		campaignCount: stats.count,
		sent: stats.sent,
		delivered: stats.delivered,
		read: stats.read,
		replies: stats.replies,
		readRate: stats.sent > 0 ? Math.round(stats.read / stats.sent * 100) : 0,
		replyRate: stats.sent > 0 ? Math.round(stats.replies / stats.sent * 100) : 0
	})).sort((a, b) => b.replies - a.replies);
	const open = conversations.filter((c) => c.status === "open").length;
	const pending = conversations.filter((c) => c.status === "pending").length;
	const resolved = conversations.filter((c) => c.status === "resolved").length;
	const closed = conversations.filter((c) => c.status === "closed").length;
	const unread = conversations.filter((c) => (c.unread_count ?? 0) > 0).length;
	const newToday = conversations.filter((c) => new Date(c.created_at).toDateString() === (/* @__PURE__ */ new Date()).toDateString()).length;
	const closedToday = conversations.filter((c) => c.resolved_at && new Date(c.resolved_at).toDateString() === (/* @__PURE__ */ new Date()).toDateString()).length;
	let totalFirstResponseTime = 0;
	let firstResponseCount = 0;
	let totalResolutionTime = 0;
	let resolutionCount = 0;
	let totalDuration = 0;
	let durationCount = 0;
	conversations.forEach((c) => {
		if (c.resolved_at) {
			const resDiff = new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime();
			totalResolutionTime += resDiff;
			resolutionCount++;
		}
		if (c.first_response_at) {
			const respDiff = new Date(c.first_response_at).getTime() - new Date(c.created_at).getTime();
			totalFirstResponseTime += respDiff;
			firstResponseCount++;
		}
		if (c.last_message_at) {
			const dur = new Date(c.last_message_at).getTime() - new Date(c.created_at).getTime();
			totalDuration += dur;
			durationCount++;
		}
	});
	const msToMin = (ms) => Math.round(ms / (1e3 * 60));
	const conversationAnalytics = {
		open,
		pending,
		resolved,
		closed,
		unread,
		newToday,
		closedToday,
		avgFirstResponseTime: firstResponseCount > 0 ? msToMin(totalFirstResponseTime / firstResponseCount) : 0,
		avgResolutionTime: resolutionCount > 0 ? msToMin(totalResolutionTime / resolutionCount) : 0,
		avgConversationDuration: durationCount > 0 ? msToMin(totalDuration / durationCount) : 0
	};
	const agentStatsMap = /* @__PURE__ */ new Map();
	if (isPrivileged) {
		(membersRaw ?? []).forEach((m) => {
			if (m.role === "agent") agentStatsMap.set(m.user_id, {
				assigned: 0,
				resolved: 0,
				pending: 0,
				totalResponseTime: 0,
				responseCount: 0,
				totalResolutionTime: 0,
				resolutionCount: 0,
				repliesSent: 0
			});
		});
		conversations.forEach((c) => {
			if (!c.assigned_to || !agentStatsMap.has(c.assigned_to)) return;
			const stats = agentStatsMap.get(c.assigned_to);
			stats.assigned++;
			if (c.status === "resolved" || c.status === "closed") {
				stats.resolved++;
				if (c.resolved_at) {
					stats.totalResolutionTime += new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime();
					stats.resolutionCount++;
				}
			} else stats.pending++;
			if (c.first_response_at) {
				stats.totalResponseTime += new Date(c.first_response_at).getTime() - new Date(c.created_at).getTime();
				stats.responseCount++;
			}
		});
		currentMessages.forEach((m) => {
			if (m.direction === "out" && !m.campaign_id && m.conversation_id) {
				const conv = conversations.find((c) => c.id === m.conversation_id);
				if (conv?.assigned_to && agentStatsMap.has(conv.assigned_to)) agentStatsMap.get(conv.assigned_to).repliesSent++;
			}
		});
	}
	const agentPerformance = Array.from(agentStatsMap.entries()).map(([agentId, stats]) => {
		const profile = membersMap.get(agentId) || {
			name: "Agent",
			avatarUrl: null
		};
		return {
			agentId,
			name: profile.name,
			avatarUrl: profile.avatarUrl,
			role: profile.role,
			assignedChats: stats.assigned,
			resolved: stats.resolved,
			pending: stats.pending,
			avgResponseTime: stats.responseCount > 0 ? msToMin(stats.totalResponseTime / stats.responseCount) : 0,
			avgResolutionTime: stats.resolutionCount > 0 ? msToMin(stats.totalResolutionTime / stats.resolutionCount) : 0,
			repliesSent: stats.repliesSent,
			onlineStatus: agentStatusesMap.get(agentId) || "offline"
		};
	});
	const { data: failuresRaw } = await userSupabase.from("campaign_recipients").select("meta_error, error, campaign_id").eq("tenant_id", tenantId).eq("status", "failed").gte("created_at", periods.start);
	const failureCountsMap = /* @__PURE__ */ new Map();
	(failuresRaw ?? []).forEach((f) => {
		const errMsg = f.meta_error || f.error || "Unknown Failure Reason";
		const codeMatch = errMsg.match(/\((\d+)\)/);
		const code = codeMatch ? codeMatch[1] : "Meta API Error";
		const key = errMsg.split(":")[0].trim();
		const existing = failureCountsMap.get(key) || {
			code,
			count: 0,
			campaignIds: /* @__PURE__ */ new Set()
		};
		existing.count++;
		if (f.campaign_id) existing.campaignIds.add(f.campaign_id);
		failureCountsMap.set(key, existing);
	});
	const suggestionsMap = {
		"Invalid Number": "Verify phone numbers are stored in full international E.164 format.",
		"Template Rejected": "Review WhatsApp Business Manager rules or verify parameter counts.",
		"Rate Limited": "Lower sending speeds, verify Meta sending tier restrictions.",
		"Blocked User": "Exclude this recipient from future campaigns. User opted out.",
		"Expired Session": "Send an approved template to re-open the 24-hour service window.",
		"Phone Not Registered": "Check WhatsApp account setups or check target number."
	};
	const failureAnalysis = Array.from(failureCountsMap.entries()).map(([reason, stats]) => {
		const names = Array.from(stats.campaignIds).map((cid) => {
			const camp = campaigns.find((c) => c.id === cid);
			return camp ? camp.name : "System";
		});
		let resolution = "Check WhatsApp credentials and network connections.";
		for (const [kw, sug] of Object.entries(suggestionsMap)) if (reason.toLowerCase().includes(kw.toLowerCase())) {
			resolution = sug;
			break;
		}
		return {
			reason,
			code: stats.code,
			count: stats.count,
			affectedCampaigns: names,
			resolution
		};
	});
	const returningContacts = contactsRaw?.filter((c) => {
		return conversations.filter((con) => con.contact_id === c.id).length > 1;
	}).length || 0;
	const contactsReplied = contactsRaw?.filter((c) => {
		return conversations.filter((con) => con.contact_id === c.id).some((con) => con.last_message_at);
	}).length || 0;
	const contactMessageCounts = {};
	const contactInbounds = {};
	currentMessages.forEach((m) => {
		if (!m.contact_id) return;
		contactMessageCounts[m.contact_id] = (contactMessageCounts[m.contact_id] || 0) + 1;
		if (m.direction === "in") contactInbounds[m.contact_id] = (contactInbounds[m.contact_id] || 0) + 1;
	});
	const buildContactRankList = (counts) => {
		return Object.entries(counts).map(([cid, count]) => {
			const c = contactsMap.get(cid);
			return {
				id: cid,
				name: c?.name || c?.phone_number_normalized || "Unknown Contact",
				phone: c?.phone_number_normalized || "Unknown",
				count
			};
		}).sort((a, b) => b.count - a.count).slice(0, 5);
	};
	const mostActiveContacts = buildContactRankList(contactInbounds);
	const mostMessagedContacts = buildContactRankList(contactMessageCounts);
	const thirtyDaysAgo = (/* @__PURE__ */ new Date(Date.now() - 720 * 60 * 60 * 1e3)).toISOString();
	const inactiveContacts = contactsRaw?.filter((c) => {
		const chats = conversations.filter((con) => con.contact_id === c.id);
		if (chats.length === 0) return true;
		const lastMsg = chats.map((con) => con.last_message_at).filter(Boolean).sort().pop();
		return !lastMsg || lastMsg < thirtyDaysAgo;
	}).length || 0;
	const contactAnalytics = {
		newContacts: currentKpis.newContacts,
		returningContacts,
		contactsReplied,
		mostActiveContacts,
		mostMessagedContacts,
		inactiveContacts
	};
	const countryCounts = {};
	contactsRaw?.forEach((c) => {
		if (c.country_code) countryCounts[c.country_code] = (countryCounts[c.country_code] || 0) + 1;
	});
	const geoAnalytics = {
		topCountries: Object.entries(countryCounts).map(([name, count]) => ({
			name,
			count
		})).sort((a, b) => b.count - a.count),
		topStates: [],
		topCities: []
	};
	const sendingCount = currentMessages.filter((m) => m.status === "sending").length;
	const realtimeMonitor = {
		sendingCount,
		recentReplies: currentMessages.filter((m) => m.direction === "in").slice(0, 5).map((m) => {
			const c = m.contact_id ? contactsMap.get(m.contact_id) : null;
			return {
				time: m.created_at,
				contactName: c?.name || c?.phone_number_normalized || "Customer",
				body: m.body || ""
			};
		}),
		recentFailures: currentMessages.filter((m) => m.direction === "out" && m.status === "failed").slice(0, 5).map((m) => {
			const c = m.campaign_id ? campaigns.find((camp) => camp.id === m.campaign_id) : null;
			return {
				time: m.created_at,
				campaignName: c ? c.name : "Freeform Chat",
				error: m.payload && m.payload.error ? m.payload.error.message : "Meta Sending Failure"
			};
		}),
		webhookHealth,
		queueLength: sendingCount,
		apiLatency: Math.floor(120 + Math.random() * 40)
	};
	const factors = [
		{
			name: "Delivery Rate",
			value: currentKpis.deliveryRate
		},
		{
			name: "Read Rate",
			value: currentKpis.readRate
		},
		{
			name: "Reply Rate",
			value: currentKpis.replyRate
		},
		{
			name: "Webhook Health",
			value: webhookHealth
		},
		{
			name: "Message Success",
			value: currentKpis.sent > 0 ? Math.round((currentKpis.sent - currentKpis.failed) / currentKpis.sent * 100) : 100
		}
	];
	const score = Math.round(factors.reduce((sum, f) => sum + f.value, 0) / factors.length);
	const recommendations = [];
	if (currentKpis.deliveryRate < 85) recommendations.push("⚠️ Delivery rate is low. Audit contact lists for invalid phone numbers.");
	if (currentKpis.replyRate < 15) recommendations.push("💡 Reply rate is low. Try rewriting your templates with clear Call-to-Actions (CTAs).");
	if (topTemplates.length > 0) recommendations.push(`✨ Template '${topTemplates[0].name}' has the highest response rate. Use it as a template blueprint.`);
	if (failureAnalysis.length > 0) recommendations.push(`🚫 Top delivery failure: '${failureAnalysis[0].reason}'. Follow resolution tips.`);
	return {
		kpis,
		deliveryFunnel,
		messageStatusDistribution,
		campaignPerformance,
		messageTrend,
		topTemplates,
		conversationAnalytics,
		agentPerformance,
		failureAnalysis,
		contactAnalytics,
		geoAnalytics,
		realtimeMonitor,
		healthScore: {
			score,
			factors,
			recommendations
		},
		role
	};
});
//#endregion
export { getReportsData_createServerFn_handler };

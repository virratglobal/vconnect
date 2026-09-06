import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-wPl4xYQJ.mjs";
import { t as createSsrRpc } from "./createSsrRpc-TuEXL4wz.mjs";
import { a as numberType, c as stringType, i as enumType, n as arrayType, o as objectType, r as booleanType, t as anyType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contacts.functions-C5DHb4ik.js
var filtersSchema = objectType({
	groupIds: arrayType(stringType().uuid()).optional(),
	tagIds: arrayType(stringType().uuid()).optional(),
	createdStart: stringType().optional().nullable(),
	createdEnd: stringType().optional().nullable(),
	campaignId: stringType().uuid().optional().nullable(),
	conversationStatus: stringType().optional().nullable(),
	assignedAgentId: stringType().uuid().optional().nullable(),
	country: stringType().optional().nullable(),
	lastActivity: stringType().optional().nullable(),
	phone: stringType().optional().nullable(),
	name: stringType().optional().nullable(),
	creatorId: stringType().uuid().optional().nullable(),
	source: stringType().optional().nullable(),
	recentlyAdded: booleanType().optional().nullable()
});
var getContactsInput = objectType({
	tenantId: stringType().uuid(),
	search: stringType().default(""),
	page: numberType().default(0),
	pageSize: numberType().default(25),
	sortBy: stringType().default("created_at"),
	sortOrder: enumType(["asc", "desc"]).default("desc"),
	filters: filtersSchema
});
var saveContactInput = objectType({
	id: stringType().uuid().optional().nullable(),
	tenantId: stringType().uuid(),
	name: stringType().max(100).optional().nullable(),
	phone: stringType().min(5).max(30),
	email: stringType().email().max(100).optional().nullable(),
	company: stringType().max(100).optional().nullable(),
	defaultCountryCode: stringType().default("91"),
	tagIds: arrayType(stringType().uuid()).default([]),
	groupIds: arrayType(stringType().uuid()).default([]),
	optInSource: stringType().optional().nullable(),
	optInDate: stringType().optional().nullable(),
	forceUpdate: booleanType().default(false)
});
var bulkUpdateInput = objectType({
	tenantId: stringType().uuid(),
	action: enumType([
		"add_tags",
		"remove_tags",
		"add_groups",
		"remove_groups",
		"delete",
		"transfer_ownership"
	]),
	contactIds: arrayType(stringType().uuid()),
	tagIds: arrayType(stringType().uuid()).default([]),
	groupIds: arrayType(stringType().uuid()).default([]),
	targetAgentId: stringType().uuid().optional().nullable()
});
var savedAudienceInput = objectType({
	id: stringType().uuid().optional().nullable(),
	tenantId: stringType().uuid(),
	name: stringType().min(1).max(100),
	description: stringType().max(500).optional().nullable(),
	criteria: anyType()
});
var getContactsList = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => getContactsInput.parse(d)).handler(createSsrRpc("81900f5b96706ca6cd67e2f2709dfaf65c5de43e99dd91941db0735aaf36bba1"));
var saveContact = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => saveContactInput.parse(d)).handler(createSsrRpc("b55c2ad8c04086f06439ae006e8965f646b3c6fda9f984c20720955c69c1cf5d"));
var bulkUpdateContacts = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => bulkUpdateInput.parse(d)).handler(createSsrRpc("e46dac3ee65098cb54fe62bad0bc8b9bfb9526e8acf62224fd5c9c4b5bea51a2"));
var saveSavedAudience = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => savedAudienceInput.parse(d)).handler(createSsrRpc("672ff08e55d4250b653b4da825783f973979a1884b8b2afe1f4e4fd959e53a71"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	id: stringType().uuid(),
	tenantId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("794c4c3e1a87c759b96030aea465e12bacfda52725c641c0976c57d1782a3e1d"));
var getContactDetails = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	contactId: stringType().uuid(),
	tenantId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("27e6a1b6213efda8ef136d9c6a72f2a13c20c493fbe9d99c4eac1a50bc406acc"));
var getAudienceContacts = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	tenantId: stringType().uuid(),
	audience: anyType(),
	search: stringType().default(""),
	page: numberType().default(0),
	pageSize: numberType().default(10)
}).parse(d)).handler(createSsrRpc("d270781ade51065ff56031dba30075cf28894d1452edc1135040a4fa89273bc4"));
var shareGroup = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	tenantId: stringType().uuid(),
	groupId: stringType().uuid(),
	shares: arrayType(objectType({
		userId: stringType().uuid(),
		canViewContacts: booleanType(),
		canUseInCampaigns: booleanType(),
		canEditAudience: booleanType(),
		canManageContacts: booleanType(),
		canReshareAudience: booleanType()
	}))
}).parse(d)).handler(createSsrRpc("1987af59ea926d77883299f24cae3159d9763786baa90c951c08ff2f53fe5dc5"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	tenantId: stringType().uuid(),
	groupId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("c175f4a69ecd4e1d897a3682cd9fe4b4086e50d1cbbd5743f375ac67908a5ec4"));
var importContactsBulkInput = objectType({
	tenantId: stringType().uuid(),
	sourceType: enumType(["bulk_paste", "csv"]),
	optInSource: stringType().optional().nullable(),
	optInDate: stringType().optional().nullable(),
	tagIds: arrayType(stringType().uuid()).default([]),
	groupIds: arrayType(stringType().uuid()).default([]),
	contacts: arrayType(objectType({
		raw: stringType(),
		normalized: stringType(),
		name: stringType().optional().nullable(),
		email: stringType().optional().nullable(),
		company: stringType().optional().nullable(),
		wasDeleted: booleanType().default(false),
		tags: arrayType(stringType().uuid()).default([]),
		groups: arrayType(stringType().uuid()).default([])
	})),
	totalRows: numberType(),
	duplicateRows: numberType(),
	invalidRows: numberType()
});
var importContactsBulk = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => importContactsBulkInput.parse(d)).handler(createSsrRpc("0fdaa2be09ff62d7297fba85d962ca367b73a6a5ae8a710a1d0adaf77b9895a6"));
//#endregion
export { importContactsBulk as a, shareGroup as c, getContactsList as i, getAudienceContacts as n, saveContact as o, getContactDetails as r, saveSavedAudience as s, bulkUpdateContacts as t };

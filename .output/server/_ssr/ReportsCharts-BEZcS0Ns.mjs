import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { a as Line, c as Cell, d as Legend, i as XAxis, l as ResponsiveContainer, n as LineChart, o as CartesianGrid, r as YAxis, s as Pie, t as PieChart, u as Tooltip } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ReportsCharts-BEZcS0Ns.js
var import_jsx_runtime = require_jsx_runtime();
function TrendsChart({ messageTrend }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
			data: messageTrend,
			margin: {
				top: 10,
				right: 10,
				left: -20,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					vertical: false,
					stroke: "hsl(var(--border))"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: "label",
					stroke: "#888888",
					fontSize: 11,
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					stroke: "#888888",
					fontSize: 11,
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
					background: "hsl(var(--popover))",
					border: "1px solid hsl(var(--border))",
					borderRadius: "10px",
					fontSize: "12px"
				} }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
					iconType: "circle",
					wrapperStyle: {
						fontSize: "11px",
						paddingTop: "10px"
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "sent",
					name: "Sent",
					stroke: "#ef4444",
					strokeWidth: 2,
					dot: false,
					activeDot: { r: 4 }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "delivered",
					name: "Delivered",
					stroke: "#3b82f6",
					strokeWidth: 2,
					dot: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "read",
					name: "Read",
					stroke: "#10b981",
					strokeWidth: 2,
					dot: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey: "replies",
					name: "Replies",
					stroke: "#f59e0b",
					strokeWidth: 2,
					dot: false
				})
			]
		})
	});
}
function DistributionChart({ messageStatusDistribution, colors }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: "100%",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
			data: messageStatusDistribution.filter((d) => d.count > 0),
			cx: "50%",
			cy: "50%",
			innerRadius: 60,
			outerRadius: 80,
			paddingAngle: 4,
			dataKey: "count",
			children: messageStatusDistribution.filter((d) => d.count > 0).map((entry, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: colors[index % colors.length] }, `cell-${index}`))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
			background: "hsl(var(--popover))",
			border: "1px solid hsl(var(--border))",
			borderRadius: "10px",
			fontSize: "12px"
		} })] })
	});
}
//#endregion
export { DistributionChart, TrendsChart };

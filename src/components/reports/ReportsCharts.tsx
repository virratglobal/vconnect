import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TrendsChartProps {
  messageTrend: any[];
}

export function TrendsChart({ messageTrend }: TrendsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={messageTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
        <ChartTooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "10px",
            fontSize: "12px",
          }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
        <Line
          type="monotone"
          dataKey="sent"
          name="Sent"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="delivered"
          name="Delivered"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="read"
          name="Read"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="replies"
          name="Replies"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface DistributionChartProps {
  messageStatusDistribution: any[];
  colors: string[];
}

export function DistributionChart({ messageStatusDistribution, colors }: DistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={messageStatusDistribution.filter((d) => d.count > 0)}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={4}
          dataKey="count"
        >
          {messageStatusDistribution
            .filter((d) => d.count > 0)
            .map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
        </Pie>
        <ChartTooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "10px",
            fontSize: "12px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

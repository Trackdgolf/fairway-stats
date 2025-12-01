import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  value: number;
  category?: "under" | "even" | "over";
}

interface StatsChartProps {
  data: ChartDataPoint[];
  title: string;
  yAxisLabel?: string;
}

const StatsChart = ({ data, title, yAxisLabel }: StatsChartProps) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-foreground font-semibold">{payload[0].payload.date}</p>
          <p className="text-sm text-muted-foreground">
            {yAxisLabel}: <span className="text-foreground font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Determine line color based on stat type
  const getLineColor = () => {
    if (title.includes("Over Par")) {
      return "hsl(var(--accent))";
    }
    return "hsl(var(--primary))";
  };

  return (
    <Card className="p-6 mb-4">
      <h3 className="text-xl font-bold text-foreground mb-6 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={getLineColor()}
            strokeWidth={3}
            dot={{ fill: getLineColor(), r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {title.includes("Over Par") && (
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Under Par</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            <span className="text-muted-foreground">Even Par</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Over Par</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatsChart;

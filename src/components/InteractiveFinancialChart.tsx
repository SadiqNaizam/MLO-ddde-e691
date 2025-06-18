import React from 'react';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  Cell,
  LabelList,
  type DotProps
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";

// Default fallback colors for Pie chart slices
const DEFAULT_PIE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-1) / 0.7)',
  'hsl(var(--chart-2) / 0.7)',
  'hsl(var(--chart-3) / 0.7)',
];

export interface InteractiveFinancialChartProps {
  chartType: 'bar' | 'pie' | 'line';
  data: any[]; // Array of data objects, e.g., { category: 'A', value1: 10, value2: 20 }
  chartConfig: ChartConfig; // ShadCN UI ChartConfig, e.g., { value1: { label: 'Value 1', color: 'hsl(var(--chart-1))' }, ... }
  categoryKey: string; // Key in data objects for category labels (X-axis for bar/line, nameKey for Pie)
  dataKeys: string[]; // Array of keys in data objects for data values. For Pie, first key is used.
  title?: string;
  description?: string;
  className?: string; // Additional classes for the Card wrapper
  chartClassName?: string; // Additional classes for ChartContainer
  height?: string | number; // Height for the chart container, e.g., "300px" or 300. Default: "300px"
  barChartLayout?: 'horizontal' | 'vertical'; // For Bar chart. Default 'vertical' (categories on X-axis)
  pieColors?: string[]; // Fallback colors for Pie chart slices
  onElementClick?: (payload: any, index: number, eventOrProps?: React.MouseEvent | DotProps) => void; // Handler for clicks on bars, pie slices, line points
  showLegend?: boolean; // Default true
  showTooltip?: boolean; // Default true
  showGrid?: boolean; // For bar/line charts. Default true
  showXAxis?: boolean; // For bar/line charts. Default true
  showYAxis?: boolean; // For bar/line charts. Default true
  showBarLabels?: boolean; // Specific for bar chart to show LabelList. Default false
}

const InteractiveFinancialChart: React.FC<InteractiveFinancialChartProps> = ({
  chartType,
  data,
  chartConfig,
  categoryKey,
  dataKeys,
  title,
  description,
  className,
  chartClassName,
  height = "300px",
  barChartLayout = 'vertical',
  pieColors = DEFAULT_PIE_COLORS,
  onElementClick,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showBarLabels = false,
}) => {
  console.log('InteractiveFinancialChart loaded:', { chartType, title });

  const handlePieSliceClick = (pieSliceData: any, index: number, event: React.MouseEvent) => {
    if (onElementClick) {
      onElementClick(pieSliceData, index, event);
    }
  };
  
  const handleLinePointClick = (linePointProps: DotProps & { payload?: any, index?: number }) => {
    if (onElementClick && linePointProps.payload && typeof linePointProps.index === 'number') {
      onElementClick(linePointProps.payload, linePointProps.index, linePointProps);
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            data={data}
            layout={barChartLayout}
            margin={{ top: showBarLabels ? 20 : 5, right: 5, left: 5, bottom: 5 }}
            onClick={(eventData: any) => { // Handles clicks on bar groups
                if (eventData && eventData.activePayload && eventData.activePayload.length > 0 && onElementClick) {
                    // activePayload contains info about the bar(s) under the cursor/click
                    // For simplicity, we take the first active payload.
                    const activeItem = eventData.activePayload[0];
                    const payload = activeItem.payload; // Original data object for the category
                    // Find index of this data object in the original data array
                    const index = data.findIndex(d => d[categoryKey] === payload[categoryKey]);
                    
                    if (index !== -1) {
                         // activeItem.dataKey tells which specific bar in a group was clicked, if applicable
                        onElementClick({ ...payload, clickedDataKey: activeItem.dataKey }, index, eventData.originalEvent);
                    }
                }
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={barChartLayout === 'horizontal'} horizontal={barChartLayout === 'vertical'} />}
            {barChartLayout === 'vertical' ? (
              <>
                {showXAxis && <XAxis dataKey={categoryKey} type="category" tickLine={false} axisLine={false} interval="preserveStartEnd" />}
                {showYAxis && <YAxis type="number" tickLine={false} axisLine={false} />}
              </>
            ) : ( // horizontal
              <>
                {showXAxis && <XAxis type="number" tickLine={false} axisLine={false} />}
                {showYAxis && <YAxis dataKey={categoryKey} type="category" tickLine={false} axisLine={false} width={Math.max(80, categoryKey.length * 7)} interval="preserveStartEnd" />}
              </>
            )}
            {showTooltip && (
              <RechartsTooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent chartConfig={chartConfig} indicator="dot" />}
              />
            )}
            {showLegend && <RechartsLegend content={<ChartLegendContent chartConfig={chartConfig} />} />}
            {dataKeys.map((dk, idx) => (
              <Bar
                key={dk}
                dataKey={dk}
                fill={chartConfig[dk]?.color || DEFAULT_PIE_COLORS[idx % DEFAULT_PIE_COLORS.length]}
                radius={4}
              >
                {showBarLabels && (
                  <LabelList
                    dataKey={dk}
                    position={barChartLayout === 'vertical' ? 'top' : 'right'}
                    offset={8}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) => value === 0 ? '' : value } // Don't show label for 0
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        );
      case 'pie':
        const pieDataKey = dataKeys[0]; // Pie charts typically use one value key
        return (
          <PieChart margin={{ top: 5, right: 5, bottom: showLegend ? 20 : 5, left: 5 }}>
            {showTooltip && (
              <RechartsTooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent chartConfig={chartConfig} nameKey={categoryKey} indicator="pie" />}
              />
            )}
            {showLegend && <RechartsLegend content={<ChartLegendContent chartConfig={chartConfig} nameKey={categoryKey} />} verticalAlign="bottom" />}
            <Pie
              data={data}
              dataKey={pieDataKey}
              nameKey={categoryKey}
              cx="50%"
              cy="50%"
              outerRadius="80%"
              onClick={onElementClick ? handlePieSliceClick : undefined}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.fill || // 1. Color from data item itself
                    chartConfig[entry[categoryKey]]?.color || // 2. Color from chartConfig using category name (e.g., 'Groceries': { color: 'green' })
                    pieColors[index % pieColors.length] // 3. Fallback default pie colors
                  }
                />
              ))}
               {showBarLabels && ( // Using showBarLabels for pie labels for simplicity
                <LabelList
                    dataKey={pieDataKey}
                    className="fill-background dark:fill-foreground"
                    stroke="hsl(var(--foreground))" // Ensure visibility on colored slices
                    formatter={(value: number, entry: any) => {
                        const percentage = entry.percent * 100;
                        return percentage > 5 ? `${percentage.toFixed(0)}%` : ''; // Show percentage if > 5%
                    }}
                    position="inside" // Or "outside"
                 />
                )}
            </Pie>
          </PieChart>
        );
      case 'line':
        return (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            {showXAxis && <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} />}
            {showYAxis && <YAxis tickLine={false} axisLine={false} />}
            {showTooltip && (
              <RechartsTooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTooltipContent chartConfig={chartConfig} indicator="line" />}
              />
            )}
            {showLegend && <RechartsLegend content={<ChartLegendContent chartConfig={chartConfig} />} />}
            {dataKeys.map((dk, idx) => (
              <Line
                key={dk}
                type="monotone"
                dataKey={dk}
                stroke={chartConfig[dk]?.color || DEFAULT_PIE_COLORS[idx % DEFAULT_PIE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, className: "cursor-pointer" }}
                activeDot={{ r: 6, className: "cursor-pointer", onClick: onElementClick ? handleLinePointClick : undefined }}
              />
            ))}
          </LineChart>
        );
      default:
        return <div className="flex items-center justify-center h-full text-destructive p-4">Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <Card className={`w-full ${className || ''}`}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="p-0 sm:p-2 md:p-4">
        <ChartContainer
            config={chartConfig}
            className={`w-full ${chartClassName || ''}`}
            style={{ height: height }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default InteractiveFinancialChart;
export type { ChartConfig }; // Export ChartConfig for convenience
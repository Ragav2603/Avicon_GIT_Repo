import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const data = [
    { month: 'Sep', rfPs: 4, aiScore: 68 },
    { month: 'Oct', rfPs: 7, aiScore: 72 },
    { month: 'Nov', rfPs: 5, aiScore: 79 },
    { month: 'Dec', rfPs: 12, aiScore: 84 },
    { month: 'Jan', rfPs: 18, aiScore: 89 },
    { month: 'Feb', rfPs: 24, aiScore: 94 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
            <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.stroke }} />
                    <span className="text-muted-foreground">{entry.name}:</span>
                    <span className="font-mono font-bold text-foreground">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export function ProjectStatsChart() {
    return (
        <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRfps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#36D1DC" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#36D1DC" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.1)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value: string) => (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
                        )}
                    />
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="rfPs"
                        name="RFPs Processed"
                        stroke="#36D1DC"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRfps)"
                        dot={{ r: 3, fill: '#36D1DC', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#36D1DC', strokeWidth: 2, stroke: '#0B121F' }}
                    />
                    <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="aiScore"
                        name="Avg AI Score (%)"
                        stroke="#a78bfa"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        dot={{ r: 3, fill: '#a78bfa', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 2, stroke: '#0B121F' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

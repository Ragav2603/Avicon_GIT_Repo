import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
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
            <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{entry.name}:</span>
                    <span className="font-mono font-bold text-foreground">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export function ProjectStatsChart() {
    return (
        <div className="w-full h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 16, right: 24, left: 0, bottom: 0 }}
                >
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        dy={10}
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        width={32}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        width={32}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148,163,184,0.15)', strokeWidth: 1 }} />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="rfPs"
                        name="RFPs Processed"
                        stroke="#36D1DC"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, fill: '#36D1DC', strokeWidth: 3, stroke: '#0B121F' }}
                        filter="url(#glow)"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="aiScore"
                        name="Avg AI Score (%)"
                        stroke="#94a3b8"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 4, fill: '#94a3b8', strokeWidth: 2, stroke: '#0B121F' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

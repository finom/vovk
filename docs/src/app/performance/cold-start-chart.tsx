'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ColdStartDatum = {
  controllers: number;
  vovk: number;
  noop: number;
};

type ColdStartChartProps = {
  coldStartData: ColdStartDatum[];
};

export function ColdStartChart({ coldStartData }: ColdStartChartProps) {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={coldStartData} margin={{ top: 16, right: 24, bottom: 16, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="controllers"
          type="number"
          scale="log"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(v) => v.toLocaleString()}
          label={{
            value: 'Controllers',
            position: 'insideBottom',
            offset: -8,
          }}
        />

        <YAxis
          scale="log"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(v) => `${v} µs`}
          label={{
            value: 'Init Time (µs)',
            angle: -90,
            position: 'insideLeft',
          }}
        />

        <Tooltip
          formatter={(value) => {
            if (typeof value !== 'number') return value ?? '';
            return `${value.toFixed(2)} µs`;
          }}
          labelFormatter={(label) => `Controllers: ${Number(label).toLocaleString()}`}
        />

        <Legend />

        <Line type="monotone" dataKey="vovk" name="Vovk.ts" strokeWidth={2} dot />

        <Line type="monotone" dataKey="noop" name="No-op decorators" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}

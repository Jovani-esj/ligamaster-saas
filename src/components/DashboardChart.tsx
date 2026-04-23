'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  jornada: string;
  goles: number;
}

interface DashboardChartProps {
  data: ChartData[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  return (
    <div className="w-full h-64 bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Goles por Jornada</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="jornada" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}
          />
          <Bar dataKey="goles" fill="#3b82f6" barSize={20} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

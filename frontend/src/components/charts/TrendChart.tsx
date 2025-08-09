import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface TrendChartProps {
  data: any[]
  lines: {
    dataKey: string
    name: string
    color: string
    strokeWidth?: number
    strokeDasharray?: string
  }[]
  xAxisKey: string
  currency?: string
  height?: number
  showGrid?: boolean
  showReferenceLine?: boolean
  referenceValue?: number
  referenceLabel?: string
}

export default function TrendChart({ 
  data, 
  lines,
  xAxisKey, 
  currency = 'USD',
  height = 300,
  showGrid = true,
  showReferenceLine = false,
  referenceValue = 0,
  referenceLabel = 'Target'
}: TrendChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          )}
          <XAxis 
            dataKey={xAxisKey}
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatCurrency(value, currency, true)}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              padding: '12px'
            }}
            formatter={(value: any, name: string) => [
              formatCurrency(value, currency), 
              lines.find(line => line.dataKey === name)?.name || name
            ]}
            labelStyle={{ color: '#1f2937', fontWeight: 500 }}
            itemStyle={{ color: '#6b7280' }}
          />
          
          {showReferenceLine && (
            <ReferenceLine 
              y={referenceValue} 
              stroke="#ef4444" 
              strokeDasharray="5 5"
              label={{ value: referenceLabel, position: "insideTopRight" }}
            />
          )}
          
          {lines.map((line, index) => (
            <Line 
              key={line.dataKey}
              type="monotone" 
              dataKey={line.dataKey} 
              name={line.name}
              stroke={line.color} 
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: line.color, strokeWidth: 2, fill: '#fff' }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
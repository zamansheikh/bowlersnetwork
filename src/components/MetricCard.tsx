import { MetricCardProps } from '@/types';

export function MetricCard({ title, value, icon: Icon, color = 'green', trend }: MetricCardProps) {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-2xl font-bold ${color === 'green' ? 'text-green-600' : 'text-gray-900'}`}>
                        {value}
                    </p>
                    {trend && (
                        <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MetricCard({ title, value, isButton = false, onClick }) {
    const Component = isButton ? 'button' : 'div';
    
    return (
        <Component
            onClick={onClick}
            className={`w-full overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm border border-gray-200 text-left ${isButton ? 'hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2' : ''}`}
        >
            <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{value}</dd>
            {isButton && <span className="mt-1 block text-sm font-medium text-indigo-600">View Details &rarr;</span>}
        </Component>
    );
}

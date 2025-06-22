import { useState, useEffect, useCallback } from 'react';
import apiClient from '/src/api/axios.js';
import { useAuth } from '/src/context/AuthContext.jsx';
import NetMovementModal from '/src/components/NetMovementModal.jsx';
import MetricCard from '/src/components/MetricCard.jsx';

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth(); // Use authLoading from context
    const [filters, setFilters] = useState(null); // Initialize filters as null
    const [filterOptions, setFilterOptions] = useState({ bases: [], equipmentTypes: [] });
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Effect to initialize filters once the user is available
    useEffect(() => {
        if (user) {
            setFilters({
                startDate: formatDateToYYYYMMDD(new Date(new Date().setMonth(new Date().getMonth() - 1))),
                endDate: formatDateToYYYYMMDD(new Date()),
                baseId: user.role !== 'Admin' ? user.baseId : '',
                equipmentTypeId: '',
            });
        }
    }, [user]);

    const fetchFilterOptions = useCallback(async () => {
        try {
            const response = await apiClient.get('/dashboard/filters');
            setFilterOptions(response.data);
        } catch (err) {
            console.error("Failed to fetch filter options", err);
        }
    }, []);

    const fetchMetrics = useCallback(async () => {
        if (!filters) return; // Don't fetch if filters aren't set yet
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get('/dashboard/metrics', { params: filters });
            setMetrics(response.data);
        } catch (err) {
            setError('Failed to fetch dashboard metrics.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (filters) { // Only fetch data once filters are initialized
            fetchFilterOptions();
            fetchMetrics();
        }
    }, [filters, fetchFilterOptions, fetchMetrics]);


    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchMetrics();
    };

    // Render a loading state until authentication is checked and filters are set
    if (authLoading || !filters) {
        return <div className="text-center p-8">Loading Dashboard...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            
            {/* Filters */}
            <form onSubmit={handleFilterSubmit} className="mt-4 p-4 bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"/>
                </div>
                {user?.role === 'Admin' && (
                     <div>
                        <label htmlFor="baseId" className="block text-sm font-medium text-gray-700">Base</label>
                        <select name="baseId" id="baseId" value={filters.baseId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                            <option value="">All Bases</option>
                            {filterOptions.bases.map(base => <option key={base.base_id} value={base.base_id}>{base.base_name}</option>)}
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="equipmentTypeId" className="block text-sm font-medium text-gray-700">Equipment Type</label>
                    <select name="equipmentTypeId" id="equipmentTypeId" value={filters.equipmentTypeId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="">All Types</option>
                        {filterOptions.equipmentTypes.map(type => <option key={type.type_id} value={type.type_id}>{type.type_name}</option>)}
                    </select>
                </div>
                 <div className="lg:col-span-4 flex justify-end">
                    <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Apply Filters</button>
                </div>
            </form>

            {/* Metrics */}
            {loading ? (
                <p className="mt-6 text-center">Loading metrics...</p>
            ) : error ? (
                <p className="mt-6 text-center text-red-500">{error}</p>
            ) : metrics && (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <MetricCard title="Opening Balance" value={metrics.openingBalance} />
                    <MetricCard title="Closing Balance" value={metrics.closingBalance} />
                    <MetricCard title="Net Movement" value={metrics.netMovement} isButton={true} onClick={() => setIsModalOpen(true)} />
                    <MetricCard title="Assigned" value={metrics.assigned} />
                    <MetricCard title="Expended" value={metrics.expended} />
                </div>
            )}
            
            <NetMovementModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} filters={filters} />
        </div>
    );
}
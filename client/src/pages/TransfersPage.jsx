import { useState, useEffect, useCallback } from 'react';
import apiClient from '/src/api/axios.js';
import { useAuth } from '/src/context/AuthContext.jsx';

const formatDateTime = (dateString) => {
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export default function TransfersPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ assets: [], bases: [] });
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formState, setFormState] = useState({
        asset_id: '',
        to_base_id: '',
        quantity: 1,
        notes: ''
    });
    const [message, setMessage] = useState({ type: '', content: '' });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [formDataRes, historyRes] = await Promise.all([
                apiClient.get('/transfers/form-data'),
                apiClient.get('/transfers/history')
            ]);
            setFormData(formDataRes.data);
            setHistory(historyRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
            setMessage({ type: 'error', content: 'Failed to load page data.' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', content: '' });
        
        if (!formState.asset_id || !formState.to_base_id) {
            setMessage({ type: 'error', content: 'Please select an asset and a destination base.' });
            return;
        }

        try {
            await apiClient.post('/transfers', formState);
            setMessage({ type: 'success', content: 'Transfer recorded successfully.' });
            setFormState({ asset_id: '', to_base_id: '', quantity: 1, notes: '' });
            fetchData();
        } catch (error) {
            console.error('Submission failed', error);
            setMessage({ type: 'error', content: 'Failed to record transfer.' });
        }
    };
    
    if (isLoading) return <div className="text-center p-8">Loading...</div>;

    return (
        <div>
            <div className="border-b border-gray-200 pb-5 mb-5">
                 <h1 className="text-2xl font-semibold text-gray-900">Asset Transfers</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 space-y-6">
                        <h2 className="text-lg font-medium text-gray-900">New Transfer</h2>
                        
                        <div>
                            <label htmlFor="asset_id" className="block text-sm font-medium text-gray-700">Asset to Transfer</label>
                            <select id="asset_id" name="asset_id" value={formState.asset_id} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="">Select an asset</option>
                                {formData.assets.map(asset => (
                                    <option key={asset.asset_id} value={asset.asset_id}>{asset.name} ({asset.serial_number || 'Bulk'})</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="to_base_id" className="block text-sm font-medium text-gray-700">Destination Base</label>
                            <select id="to_base_id" name="to_base_id" value={formState.to_base_id} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="">Select a base</option>
                                {formData.bases.map(base => (
                                    <option key={base.base_id} value={base.base_id}>{base.base_name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input type="number" name="quantity" id="quantity" value={formState.quantity} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" min="1" />
                        </div>

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea id="notes" name="notes" rows={3} value={formState.notes} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                        </div>

                        {message.content && (
                            <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                {message.content}
                            </div>
                        )}

                        <div>
                            <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Record Transfer</button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-2">
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Transfer History</h2>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Date</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Asset</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">From</th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">To</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {history.filter(item => item.movement_type === 'transfer_out').length > 0 ? history.filter(item => item.movement_type === 'transfer_out').map((item, index) => (
                                    <tr key={index}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{formatDateTime(item.transaction_date)}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.asset_name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.from_base}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.to_base}</td>
                                    </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-10 text-gray-500">No transfer history found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
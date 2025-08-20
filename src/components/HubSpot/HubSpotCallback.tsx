import React from 'react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import hubspotService from '../../services/hubspotService';

const HubSpotCallback: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
	const [message, setMessage] = useState('Connecting to HubSpot...');

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const code = params.get('code');
		const error = params.get('error');
		const errorDescription = params.get('error_description');

		if (error) {
			setStatus('error');
			setMessage(errorDescription || 'HubSpot authorization failed.');
			return;
		}

		if (!code) {
			setStatus('error');
			setMessage('Missing authorization code from HubSpot.');
			return;
		}

		(async () => {
			try {
				sessionStorage.setItem('hubspot_oauth_code', code);
				await hubspotService.exchangeCode(code);
				setStatus('success');
				setMessage('Connected to HubSpot. Redirecting to Settings...');
				const timer = setTimeout(() => navigate('/settings?tab=integrations'), 1200);
				return () => clearTimeout(timer);
			} catch (e: any) {
				setStatus('error');
				setMessage(e?.message || 'Failed to connect to HubSpot');
			}
		})();

	}, [location.search, navigate]);

	return (
		<div className="min-h-full p-6 flex items-center justify-center">
			<div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
				{status === 'processing' && (
					<div className="flex flex-col items-center space-y-3">
						<Loader2 className="w-6 h-6 animate-spin text-blue-600" />
						<p className="text-gray-700">{message}</p>
					</div>
				)}
				{status === 'success' && (
					<div className="flex flex-col items-center space-y-3">
						<CheckCircle className="w-6 h-6 text-green-600" />
						<p className="text-gray-700">{message}</p>
					</div>
				)}
				{status === 'error' && (
					<div className="flex flex-col items-center space-y-3">
						<XCircle className="w-6 h-6 text-red-600" />
						<p className="text-gray-700">{message}</p>
						<button
							onClick={() => navigate('/settings?tab=integrations')}
							className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							Back to Settings
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default HubSpotCallback;



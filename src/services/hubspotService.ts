import { API_BASE_URL } from './api/config';

export interface HubSpotCompany {
	id: string;
	name: string;
	domain?: string;
	industry?: string;
	phone?: string;
	address?: string;
	website?: string;
}

export interface HubSpotContact {
	firstName?: string;
	lastName?: string;
	jobTitle?: string;
	email?: string;
	phone?: string;
	address?: string;
}

function getAccessToken(): string | null {
    const token = localStorage.getItem('hubspot_access_token');
    if (!token) return null;
    const exp = localStorage.getItem('hubspot_access_token_expires_at');
    if (exp) {
        const expiresAt = parseInt(exp, 10);
        if (!Number.isNaN(expiresAt) && Date.now() > expiresAt) {
            // token expired
            localStorage.removeItem('hubspot_access_token');
            localStorage.removeItem('hubspot_access_token_expires_at');
            localStorage.removeItem('hubspot_connected');
            return null;
        }
    }
    return token;
}

function setAccessToken(token: string, expiresIn?: number) {
	localStorage.setItem('hubspot_access_token', token);
	localStorage.setItem('hubspot_connected', 'true');
	if (expiresIn) {
		const exp = Date.now() + expiresIn * 1000;
		localStorage.setItem('hubspot_access_token_expires_at', String(exp));
	}
}

async function exchangeCode(code: string): Promise<void> {
	const resp = await fetch(`${API_BASE_URL}/hubspot/oauth/exchange`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ code }),
	});
	if (!resp.ok) {
		const text = await resp.text();
		throw new Error(`Failed to exchange code: ${text}`);
	}
    const data = await resp.json();
    // Debug log full token response shape
    console.log('[HubSpot] Token exchange response', data);
	const accessToken = data.access_token || data.value?.access_token;
	const expiresIn = data.expires_in || data.value?.expires_in;
	if (!accessToken) {
		throw new Error('No access_token in response');
	}
	setAccessToken(accessToken, expiresIn);
}

async function getCompanies(): Promise<HubSpotCompany[]> {
	const token = getAccessToken();
	if (!token) throw new Error('HubSpot not connected');
	const resp = await fetch(`${API_BASE_URL}/hubspot/companies`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!resp.ok) {
		const text = await resp.text();
		throw new Error(`Failed to fetch companies: ${text}`);
	}
    const json = await resp.json();
    console.log('[HubSpot] Companies response', json);
    const results = json.results || json.value?.results || [];
	return results.map((r: any) => {
		const p = r.properties || {};
        const parts = [p.address, p.city, p.state, p.country, p.zip].filter(Boolean);
        // Deduplicate adjacent equal parts (e.g., city==state)
        const addressParts = parts.filter((val: string, idx: number, arr: string[]) => idx === 0 || val !== arr[idx - 1]).join(', ');
		return {
			id: r.id,
			name: p.name || 'Unnamed Company',
			domain: p.domain,
			industry: p.industry,
            phone: p.phone,
            address: addressParts || undefined,
            website: p.website || p.domain,
		} as HubSpotCompany;
	});
}

async function getCompanyPrimaryContact(companyId: string): Promise<HubSpotContact | null> {
	const token = getAccessToken();
	if (!token) throw new Error('HubSpot not connected');
	const resp = await fetch(`${API_BASE_URL}/hubspot/companies/${companyId}/contacts`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!resp.ok) {
		return null;
	}
    const json = await resp.json();
    console.log('[HubSpot] Company contact response', json);
	const p = json.properties || {};
	const addressParts = [p.address, p.city, p.state, p.country, p.zip].filter(Boolean).join(', ');
	return {
		firstName: p.firstname,
		lastName: p.lastname,
		jobTitle: p.jobtitle,
		email: p.email,
		phone: p.phone,
		address: addressParts || undefined,
	};
}

export const hubspotService = {
	getAccessToken,
	exchangeCode,
	getCompanies,
	getCompanyPrimaryContact,
};

export default hubspotService;



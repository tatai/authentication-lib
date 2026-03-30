import AuthenticationService, { unauthenticatedPost } from './authentication.service';
import { getAccessToken, getRefreshToken, store } from './token';

const getAuthorization = () => `Bearer ${getAccessToken()}`;

async function refreshToken(authenticationServiceUrl: string): Promise<any> {
	const refreshToken = getRefreshToken();

	return unauthenticatedPost(`${authenticationServiceUrl}/refresh`, { refreshToken });
}

const refresh = (authenticationServiceUrl: string, authenticationService: AuthenticationService) => {
	return new Promise((resolve, reject) => {
		refreshToken(authenticationServiceUrl)
			.then((response) => {
				store(
					response.data.accessToken,
					response.data.refreshToken,
					response.data.expiresIn,
					response.data.refreshExpiresIn
				);
				resolve({
					accessToken: response.data.accessToken,
					refreshToken: response.data.refreshToken,
					expiresIn: response.data.expiresIn,
					refreshExpiresIn: response.data.refreshExpiresIn,
				});
			})
			.catch(error => {
				if(error.response.status === 401) {
					authenticationService.getLoginUrl()
						.then((redirectTo) => {
							window.location.href = redirectTo;
						})
				}
				reject(error)
			});
	});
};

export default class AuthenticatedHttpClient {
	private readonly authenticationService: AuthenticationService;
	private readonly authenticationServiceUrl: string;

	constructor(authenticationServiceUrl: string, authenticationService: AuthenticationService) {
		this.authenticationServiceUrl = authenticationServiceUrl;
		this.authenticationService = authenticationService;
	}

	private buildHeaders(extra: object = {}): HeadersInit {
		return {
			Authorization: getAuthorization(),
			...extra,
		};
	}

	private async request(fn: () => Promise<Response>, retry = true): Promise<any> {
		const response = await fn();
		if (response.status === 401 && retry) {
			await refresh(this.authenticationServiceUrl, this.authenticationService);
			return this.request(fn, false);
		}
		if (!response.ok) {
			const error: any = new Error(`HTTP error ${response.status}`);
			error.response = { status: response.status };
			throw error;
		}
		const text = await response.text();
		return { data: text ? JSON.parse(text) : null };
	}

	get = (requestUrl: string, params = null, responseType = 'json', headers = {}): Promise<any> => {
		const url = params
			? `${requestUrl}?${new URLSearchParams(params)}`
			: requestUrl;
		return this.request(() =>
			fetch(url, { headers: this.buildHeaders(headers) })
		);
	};

	post = (requestUrl: string, data: any, headers = { 'Content-Type': 'application/json' }): Promise<any> => {
		return this.request(() =>
			fetch(requestUrl, {
				method: 'POST',
				headers: this.buildHeaders(headers),
				body: JSON.stringify(data),
			})
		);
	};

	put = (requestUrl: string, data: any, headers = { 'Content-Type': 'application/json' }): Promise<any> => {
		return this.request(() =>
			fetch(requestUrl, {
				method: 'PUT',
				headers: this.buildHeaders(headers),
				body: JSON.stringify(data),
			})
		);
	};

	remove = (requestUrl: string): Promise<any> => {
		return this.request(() =>
			fetch(requestUrl, { method: 'DELETE', headers: this.buildHeaders() })
		);
	};

	patch = (requestUrl: string, data: any, headers = { 'content-type': 'application/json' }): Promise<any> => {
		return this.request(() =>
			fetch(requestUrl, {
				method: 'PATCH',
				headers: this.buildHeaders(headers),
				body: JSON.stringify(data),
			})
		);
	};

}

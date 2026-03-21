async function unauthenticatedPost(url: string, body: object): Promise<any> {
	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});
	if (!response.ok) {
		const error: any = new Error(`HTTP error ${response.status}`);
		error.response = { status: response.status };
		throw error;
	}
	return { data: await response.json() };
}

export { unauthenticatedPost };

export default class AuthenticationService {

	private readonly authenticationServiceUrl: string;
	private readonly redirectUri: string;

	constructor(authenticationServiceUrl: string, redirectUri: string) {
		this.authenticationServiceUrl = authenticationServiceUrl;
		this.redirectUri = redirectUri;
	}

	getTokenByCode = async (code: string): Promise<any> => {
		return unauthenticatedPost(`${this.authenticationServiceUrl}/code`, {
			code,
			redirectUri: this.redirectUri,
		});
	}

	getLoginUrl = async (): Promise<any> => {
		return new Promise((resolve, reject) => {
			unauthenticatedPost(`${this.authenticationServiceUrl}/login`, {
				redirectUri: this.redirectUri,
			})
				.then(response => resolve(response.data.redirectTo))
				.catch(error => reject(error));
		});
	}

	exitSession = async (refreshToken: string): Promise<any> => {
		return unauthenticatedPost(`${this.authenticationServiceUrl}/logout`, {
			refreshToken,
		});
	}

}

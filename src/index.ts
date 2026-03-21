import AuthenticationService from "./services/authentication.service";
import AuthenticatedHttpClient from "./services/authenticate-http-client";
import {clean, getAccessToken, getRefreshToken, store} from "./services/token";

const markAsAuthenticated = (
	accessToken: string,
	refreshToken: string,
	expiresIn: number,
	refreshExpiresIn: number
) => store(accessToken, refreshToken, expiresIn, refreshExpiresIn);

const markAsUnauthenticated = () => clean();

const isAuthenticated = (): boolean => getAccessToken() !== null;

class Authentication {
	private readonly authenticationService: AuthenticationService;
	public readonly authenticatedClient: AuthenticatedHttpClient;

	constructor(authenticationServiceUrl: string, loginRedirectUrl: string) {
		this.authenticationService = new AuthenticationService(authenticationServiceUrl, loginRedirectUrl);
		this.authenticatedClient = new AuthenticatedHttpClient(
			authenticationServiceUrl,
			this.authenticationService
		);
	}

	logout = async (): Promise<any> => {
		return new Promise((resolve, reject) => {
			this.authenticationService.exitSession(getRefreshToken())
				.then(() => {
					markAsUnauthenticated();
					resolve("success");
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	goToLoginPage = () => {
		this.authenticationService.getLoginUrl()
			.then((redirectTo) => {
				window.location.href = redirectTo;
			})
			.catch((error) => {
				throw error;
			});
	};

	authenticateWithCode = (code): Promise<any> => {
		return new Promise((resolve, reject) => {
			this.authenticationService.getTokenByCode(code)
				.then((response) => {
					markAsAuthenticated(
						response.data.accessToken,
						response.data.refreshToken,
						response.data.expiresIn,
						response.data.refreshExpiresIn
					);
					resolve("success");
				})
				.catch((error) => {
					markAsUnauthenticated();
					reject(error);
				});
		});
	};

}

export {
	isAuthenticated,
	Authentication,
	AuthenticatedHttpClient
}
const store = (accessToken: string, refreshToken: string, expiresIn: number, refreshExpiresIn: number) => {
	const date = new Date();
	const expirateTimeInMilliseconds = date.getTime() + expiresIn * 1000;
	const refreshExpiresInInMilliseconds = date.getTime() + refreshExpiresIn * 1000;
	localStorage.setItem("access_token", accessToken);
	localStorage.setItem("refresh_token", refreshToken);
	localStorage.setItem("expires_at", String(expirateTimeInMilliseconds));
	localStorage.setItem("refresh_expires_at", String(refreshExpiresInInMilliseconds));
}

const clean = () => {
	localStorage.removeItem("access_token");
	localStorage.removeItem("refresh_token");
	localStorage.removeItem("expires_at");
	localStorage.removeItem("refresh_expires_at");
}

const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

export {
	store,
	clean,
	getAccessToken,
	getRefreshToken,
}
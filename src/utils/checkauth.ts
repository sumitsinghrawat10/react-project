
export function checkAuth(): string | null {
	const user = localStorage.getItem("user");
	if (user !== "") {
		return user;
	} else {
		return null;
	}
}
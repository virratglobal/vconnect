import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as supabase } from "./client-DTaxocpy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-auth-BLya4MAJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)({
	user: null,
	session: null,
	loading: true,
	signOut: async () => {}
});
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
			if (!mounted) return;
			setSession(s);
			setLoading(false);
		});
		supabase.auth.getSession().then(({ data }) => {
			if (!mounted) return;
			setSession(data.session);
			setLoading(false);
		});
		return () => {
			mounted = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			user: session?.user ?? null,
			session,
			loading,
			signOut: async () => {
				await supabase.auth.signOut();
			}
		},
		children
	});
}
function useAuth() {
	return (0, import_react.useContext)(AuthContext);
}
//#endregion
export { useAuth as n, AuthProvider as t };

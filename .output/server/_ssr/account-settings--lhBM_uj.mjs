import { o as __toESM } from "../_runtime.mjs";
import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as useServerFn } from "./useServerFn-BqzygRuj.mjs";
import { t as supabase } from "./client-DTaxocpy.mjs";
import { n as useAuth } from "./use-auth-BLya4MAJ.mjs";
import { n as deleteUserAccount } from "./account-settings-BSXiW5JP.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as CardHeader, i as CardFooter, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { t as Switch } from "./switch-C_mzcXif.mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { G as Lock, Mt as TriangleAlert, at as EyeOff, b as Shield, it as Eye, s as User, wt as Bell } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-settings--lhBM_uj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountSettingsPage() {
	const { user } = useAuth();
	const qc = useQueryClient();
	const [activeTab, setActiveTab] = (0, import_react.useState)("profile");
	(0, import_react.useEffect)(() => {
		if (typeof window !== "undefined") {
			if (new URLSearchParams(window.location.search).get("recovery") === "true") {
				setActiveTab("security");
				toast.info("Successfully signed in via password recovery link. Please update your password below.", { duration: 8e3 });
			}
		}
	}, []);
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [avatarUrl, setAvatarUrl] = (0, import_react.useState)("");
	const [updatingProfile, setUpdatingProfile] = (0, import_react.useState)(false);
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [updatingPassword, setUpdatingPassword] = (0, import_react.useState)(false);
	const [emailNotifications, setEmailNotifications] = (0, import_react.useState)(true);
	const [smsNotifications, setSmsNotifications] = (0, import_react.useState)(false);
	const [marketingEmails, setMarketingEmails] = (0, import_react.useState)(true);
	const [twoFactor, setTwoFactor] = (0, import_react.useState)(false);
	const { data: profile, isLoading } = useQuery({
		queryKey: ["my-profile", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
			if (error) throw error;
			if (data) {
				setFullName(data.full_name || "");
				setAvatarUrl(data.avatar_url || "");
			}
			return data;
		}
	});
	async function handleUpdateProfile(e) {
		e.preventDefault();
		if (!user) return;
		setUpdatingProfile(true);
		try {
			const { error } = await supabase.from("profiles").update({
				full_name: fullName.trim(),
				avatar_url: avatarUrl.trim() || null,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", user.id);
			if (error) throw error;
			toast.success("Profile updated successfully");
			await qc.invalidateQueries({ queryKey: ["my-profile", user.id] });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to update profile");
		} finally {
			setUpdatingProfile(false);
		}
	}
	async function handleUpdatePassword(e) {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error("New passwords do not match");
			return;
		}
		if (newPassword.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}
		setUpdatingPassword(true);
		try {
			const { error } = await supabase.auth.updateUser({ password: newPassword });
			if (error) throw error;
			toast.success("Password updated successfully");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to update password");
		} finally {
			setUpdatingPassword(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl md:text-3xl font-extrabold tracking-tight",
			children: "Account Settings"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground mt-1.5",
			children: "Manage your personal profile, security preferences, and account credentials."
		})] }), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-[300px] bg-muted rounded animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "animate-pulse border-border/50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-1/3 bg-muted rounded" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-1/2 bg-muted rounded" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { className: "h-40 bg-muted/20" })]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: activeTab,
			onValueChange: setActiveTab,
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "bg-muted p-1 rounded-xl w-full sm:w-auto flex overflow-x-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "profile",
							className: "rounded-lg gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "size-4" }), " Profile Details"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "security",
							className: "rounded-lg gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), " Password & Security"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "preferences",
							className: "rounded-lg gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), " Notification Preferences"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "profile",
					className: "space-y-6 outline-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
						onSubmit: handleUpdateProfile,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-border/50 shadow-sm rounded-2xl overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-lg font-bold",
									children: "Profile Information"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Update your display name and profile picture." })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: "profile-email",
													children: "Email Address"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "profile-email",
													value: user?.email || "",
													disabled: true,
													className: "bg-muted rounded-xl cursor-not-allowed font-medium"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground",
													children: "Your login email is managed by your account administrator and cannot be changed here."
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "profile-name",
												children: "Full Name"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "profile-name",
												placeholder: "John Doe",
												value: fullName,
												onChange: (e) => setFullName(e.target.value),
												required: true,
												className: "rounded-xl"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "profile-avatar",
												children: "Avatar Photo URL"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-4 items-center",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border shrink-0",
													children: avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														src: avatarUrl,
														alt: "Avatar Preview",
														className: "size-full rounded-full object-cover",
														onError: (e) => {
															e.target.style.display = "none";
														}
													}) : (fullName?.[0] || user?.email?.[0] || "U").toUpperCase()
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "profile-avatar",
													placeholder: "https://example.com/avatar.jpg",
													value: avatarUrl,
													onChange: (e) => setAvatarUrl(e.target.value),
													className: "rounded-xl flex-1"
												})]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, {
									className: "bg-muted/30 border-t border-border/50 py-4 flex justify-end",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										disabled: updatingProfile,
										className: "bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl",
										children: updatingProfile ? "Saving…" : "Save Changes"
									})
								})
							]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "security",
					className: "space-y-6 outline-none",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
							onSubmit: handleUpdatePassword,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "border-border/50 shadow-sm rounded-2xl overflow-hidden",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-lg font-bold",
										children: "Change Password"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Ensure your account is using a secure password to prevent unauthorized access." })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "space-y-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "new-password",
												children: "New Password"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													id: "new-password",
													type: showPassword ? "text" : "password",
													placeholder: "••••••••",
													value: newPassword,
													onChange: (e) => setNewPassword(e.target.value),
													required: true,
													className: "rounded-xl pr-10"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: () => setShowPassword(!showPassword),
													className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
													children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
												})]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "confirm-password",
												children: "Confirm Password"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "confirm-password",
												type: showPassword ? "text" : "password",
												placeholder: "••••••••",
												value: confirmPassword,
												onChange: (e) => setConfirmPassword(e.target.value),
												required: true,
												className: "rounded-xl"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, {
										className: "bg-muted/30 border-t border-border/50 py-4 flex justify-end",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "submit",
											disabled: updatingPassword,
											className: "bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl",
											children: updatingPassword ? "Updating…" : "Update Password"
										})
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-border/50 shadow-sm rounded-2xl overflow-hidden border-warning/20 bg-warning/5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
									className: "text-base font-bold flex items-center gap-2 text-warning-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-5 text-warning" }), " Two-Factor Authentication"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Add an extra layer of security to your account." })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "flex items-center justify-between py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-0.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-semibold text-foreground",
											children: "Authenticator App"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Use an app like Google Authenticator to generate verification codes."
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: twoFactor,
										onCheckedChange: (checked) => {
											setTwoFactor(checked);
											toast.info(checked ? "2FA Setup is coming soon." : "2FA disabled.");
										}
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, { className: "py-2" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteAccountSection, {})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "preferences",
					className: "space-y-6 outline-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/50 shadow-sm rounded-2xl overflow-hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-lg font-bold",
								children: "Notifications"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Configure how you receive updates and activity alerts." })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "divide-y divide-border/50 space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between pt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-0.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-semibold text-foreground",
												children: "Email Notifications"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Receive critical alerts regarding campaigns, templates, and team invites."
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: emailNotifications,
											onCheckedChange: setEmailNotifications
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between pt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-0.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-semibold text-foreground",
												children: "SMS Notifications"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Get instant text alerts when a campaign is suspended or billing fails."
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: smsNotifications,
											onCheckedChange: setSmsNotifications
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between pt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-0.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-sm font-semibold text-foreground",
												children: "Marketing & Product Updates"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: "Receive tips, tutorials, and new feature announcements."
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: marketingEmails,
											onCheckedChange: setMarketingEmails
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, {
								className: "bg-muted/30 border-t border-border/50 py-4 flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: () => {
										toast.success("Preferences saved successfully");
									},
									className: "bg-[#CC1100] hover:bg-[#B00E00] text-white font-semibold rounded-xl",
									children: "Save Preferences"
								})
							})
						]
					})
				})
			]
		})]
	});
}
function DeleteAccountSection() {
	const { signOut } = useAuth();
	const [confirmText, setConfirmText] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const deleteAccountFn = useServerFn(deleteUserAccount);
	async function handleDeleteAccount(e) {
		e.preventDefault();
		if (confirmText !== "DELETE ACCOUNT") {
			toast.error("Please type 'DELETE ACCOUNT' to confirm.");
			return;
		}
		if (!confirm("Are you absolutely sure you want to permanently delete your account? This will log you out, delete your profile, and remove you from all organizations. This action is permanent and cannot be undone.")) return;
		setLoading(true);
		try {
			await deleteAccountFn();
			toast.success("Account deleted successfully.");
			await signOut();
			window.location.href = "/auth";
		} catch (err) {
			toast.error(err.message || "Failed to delete account");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "border-border/50 shadow-sm rounded-2xl overflow-hidden border-destructive/20 bg-destructive/5 mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "text-base font-bold flex items-center gap-2 text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5 text-destructive animate-pulse" }), " Danger Zone: Delete Account"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Permanently delete your account and all associated personal data." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleDeleteAccount,
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "confirm-delete-account",
							children: [
								"Type ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono bg-destructive/10 px-1.5 py-0.5 rounded text-destructive font-bold text-xs",
									children: "DELETE ACCOUNT"
								}),
								" to confirm:"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "confirm-delete-account",
							placeholder: "DELETE ACCOUNT",
							value: confirmText,
							onChange: (e) => setConfirmText(e.target.value),
							className: "rounded-xl border-destructive/20 focus-visible:ring-destructive"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: loading || confirmText !== "DELETE ACCOUNT",
						variant: "destructive",
						className: "rounded-xl font-semibold w-full sm:w-auto",
						children: loading ? "Deleting Account…" : "Permanently Delete Account"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardFooter, { className: "py-2" })
		]
	});
}
//#endregion
export { AccountSettingsPage as component };

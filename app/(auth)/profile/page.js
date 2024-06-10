"use client";

import { useState, useEffect} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SignoutButton from "@components/SignoutButton";
import Image from "next/image";
import Link from "next/link";

const Profile = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
	const [username, setUsername] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [deleteUsername, setDeleteUsername] = useState("");
	const [isChangingUsername, setIsChangingUsername] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);
	const [error, setError] = useState(null);
	const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
        router.push("/unauthenticated");
        }
    }, [status, router]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await fetch("/api/get-user-details");
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    setUsername(data.username);
                } else {
                    throw new Error("Failed to fetch user details");
                }
            } catch (error) {
                setError(error.message);
            }
        };

        fetchUserDetails();
    }, []);

	const handleUsernameChange = (event) => {
		setUsername(event.target.value);
	};

	const handleCurrentPasswordChange = (event) => {
		setCurrentPassword(event.target.value);
	};

	const handleNewPasswordChange = (event) => {
		setNewPassword(event.target.value);
	};

	const handleDeleteUsernameChange = (event) => {
		setDeleteUsername(event.target.value);
	};

	const handleSaveUsername = async () => {
		try {
			setIsChangingUsername(true);
			const response = await fetch("/api/change-username", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					newUsername: username,
				}),
			});

			if (response.ok) {
				setSuccessMessage("Username changed successfully.");
				setIsChangingUsername(false);
                setUser({...user, username: username});
			} else {
				throw new Error("Failed to change username");
			}
		} catch (error) {
			setError(error.message);
			setIsChangingUsername(false);
		}
	};

	const handleSavePassword = async () => {
		try {
			setIsChangingPassword(true);
			const response = await fetch("/api/change-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					currentPassword,
					newPassword,
				}),
			});

			if (response.ok) {
				setSuccessMessage("Password changed successfully.");
				setIsChangingPassword(false);
			} else {
				throw new Error("Failed to change password");
			}
		} catch (error) {
			setError(error.message);
			setIsChangingPassword(false);
		}
	};

	const handleDeleteAccount = async () => {
		try {
			setIsDeletingAccount(true);
			const response = await fetch("/api/delete-account", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username: deleteUsername,
				}),
			});

			if (response.ok) {
				router.push("/");
			} else {
				throw new Error("Failed to delete account");
			}
		} catch (error) {
			setError(error.message);
			setIsDeletingAccount(false);
		}
	};

	const handleCloseDialogs = () => {
		setShowDeleteAccountDialog(false);
		setShowUsernameDialog(false);
		setShowPasswordDialog(false);
    };
    
    if (status === "loading") {
        return (
        <div className="bg-paleRose flex justify-center items-center h-screen">
            <div role="status">
            <svg
                aria-hidden="true"
                className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-stilleto"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
                />
                <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
                />
            </svg>
            <span className="sr-only">Loading...</span>
            </div>
            <div className="text-center">
            <h1 className="text-8xl font-bold mb-4 text-green-600">Loading...</h1>
            <p className="text-lg">Please wait</p>
            </div>
        </div>
        );
    }
    
    if (status === "authenticated") {
        return (
			<div className="flex h-screen w-screen">
				{/* Sidebar */}
				<div className="w-1/6 h-screen bg-paleRose flex flex-col justify-between border-double border-r-4 border-tickleMePink">
					<div className="w-full">
						<div className="p-4 text-center">
							<Image
								src="/images/logofull.svg"
								width={300}
								height={100}
								alt="Logo"
							/>
						</div>
						<div className="p-4 text-center flex flex-col justify-center items-center gap-y-10 mt-10 w-full">
							<button
								className="secondary-btn flex flex-row gap-4 w-5/6 justify-center bg-stilleto"
								style={{
									boxShadow: "0 4px 4px -2px rgba(0,0,0,0.3)",
								}}
							>
								<Image
									src="/images/createicon.svg"
									width={20}
									height={20}
									alt="Create"
								/>
								<Link href="/dashboard">Create</Link>
							</button>
							<button
								className="secondary-btn flex flex-row gap-4 w-5/6 justify-center bg-stilleto"
								style={{
									boxShadow: "0 4px 4px -2px rgba(0,0,0,0.3)",
								}}
							>
								<Image
									src="/images/savedicon.svg"
									width={20}
									height={20}
									alt="Saved"
								/>
								<Link href="/saved">Saved</Link>
							</button>
						</div>
					</div>
					<div className="p-4 flex flex-row justify-center items-center gap-5 text-center text-xl font-inter font-bold text-tawnyPort">
						<Image
							src="/images/usericon.svg"
							width={30}
							height={30}
							alt="User"
						/>
						<Link href="/profile">
							{user ? user.username : "User"}
						</Link>
					</div>
				</div>
				{/* Main Content */}
				<div className="flex w-5/6 flex-col justify-center items-center p-4 relative overflow-y-scroll">
					<div className="absolute top-5 right-20">
						<SignoutButton />
					</div>
					<h1 className="primary-text font-lora font-normal mb-4 text-center">
						Profile & Settings
					</h1>
					<div className="w-full flex flex-col items-center gap-4 mt-6">
						{/* Change Username */}
						<h2 className="secondary-text mt-2 mb-2 font-semibold text-center">
							Change Username
						</h2>
						<div className="flex flex-row items-center gap-2 w-full">
							<input
								type="text"
								value={username}
								onChange={handleUsernameChange}
								className="input w-[600px] h-[40px] px-3 py-4 pl-14 text-tawnyPort text-md mind-h-[40px]"
								disabled={isChangingUsername}
							/>
							<button
								onClick={handleSaveUsername}
								className="primary-btn w-[120px]"
								disabled={isChangingUsername}
							>
								{isChangingUsername ? "Changing..." : "Save"}
							</button>
						</div>
						{/* Change Password */}
						<h2 className="secondary-text mt-2 mb-2 font-semibold text-center">
							Change Password (Only for non-Google users)
						</h2>
						<div className="flex flex-row items-center gap-2 w-full">
							<div className="flex flex-col gap-2">
								<input
									type="password"
									value={currentPassword}
									onChange={handleCurrentPasswordChange}
									placeholder="Current Password"
									className="input w-[600px] h-[40px] px-3 py-4 pl-14 text-tawnyPort text-md mind-h-[40px]"
									disabled={
										isChangingPassword || user?.googleUser
									}
								/>
								<input
									type="password"
									value={newPassword}
									onChange={handleNewPasswordChange}
									placeholder="New Password"
									className="input w-[600px] h-[40px] px-3 py-4 pl-14 text-tawnyPort text-md mind-h-[40px]"
									disabled={
										isChangingPassword || user?.googleUser
									}
								/>
							</div>
							<button
								onClick={handleSavePassword}
								className="primary-btn w-[120px]"
								disabled={
									isChangingPassword || user?.googleUser
								}
							>
								{isChangingPassword ? "Changing..." : "Save"}
							</button>
						</div>
						{/* Dark Mode Toggle */}

						<div className="flex flex-row items-center gap-2 w-full">
							<h2 className="secondary-text mt-2 mb-2 font-semibold text-center">
								Dark Mode
							</h2>
							<label className="switch">
								<input type="checkbox" />
								<span className="slider round"></span>
							</label>
						</div>
						{/* Delete Account */}
						<h2 className="secondary-text mt-2 mb-2 font-semibold text-center">
							Delete Account
						</h2>
						<button
							onClick={() => setShowDeleteAccountDialog(true)}
							className="secondary-btn w-[120px]"
							disabled={isDeletingAccount}
						>
							Delete
						</button>
						{showDeleteAccountDialog && (
							<div className="fixed inset-0 flex justify-center items-center">
								<div className="absolute inset-0 bg-gray-900 opacity-50"></div>
								<div className="relative my-auto mx-auto flex justify-center items-center border-2 border-black w-1/4 h-1/4 bg-white rounded-xl">
									<div className="w-full p-4">
										<h2 className="secondary-text mb-2">
											Enter your username to confirm:
										</h2>
										<input
											type="text"
											value={deleteUsername}
											onChange={
												handleDeleteUsernameChange
											}
											placeholder="Username"
											className="p-2 border-2 w-full border-black rounded-xl"
										/>
										{deleteUsername &&
											deleteUsername !==
												user.username && (
												<p className="text-red-500">
													Username does not match.
												</p>
											)}
										<div className="flex flex-row justify-center items-center mt-5 gap-4">
											<button
												onClick={handleDeleteAccount}
												className="primary-btn"
												disabled={
													isDeletingAccount ||
													deleteUsername !==
														user.username
												}
											>
												{isDeletingAccount
													? "Deleting..."
													: "Confirm"}
											</button>
											<button
												onClick={handleCloseDialogs}
												className="primary-btn"
											>
												Cancel
											</button>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
					{/* Error and Success Messages */}
					{error && (
						<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
							<div
								style={{
									backgroundColor: "white",
									padding: "20px",
									borderRadius: "5px",
								}}
							>
								<h2>Error</h2>
								<p>{error}</p>
								<button onClick={() => setError(null)}>
									Close
								</button>
							</div>
						</div>
					)}
					{successMessage && (
						<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
							<div
								style={{
									backgroundColor: "white",
									padding: "20px",
									borderRadius: "5px",
								}}
							>
								<h2>Success</h2>
								<p>{successMessage}</p>
								<button onClick={() => setSuccessMessage(null)}>
									Close
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		);
    }

    return null;
};

export default Profile;

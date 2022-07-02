import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useState } from "react";
import jwt from "jsonwebtoken";

export default function Home(props) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("You are not authenticated");
	const handleSubmit = async () => {
		const res = await fetch("/api/auth/sign-in", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: email,
				password: password,
				userType: "foodie-user",
			}),
		}).then((t) => t.json());
		if (res.status == "success") {
			const token = res.token;
			const json = jwt.decode(token);
			if (json.role.includes("admin")) setMessage(token);
		}
		setEmail("");
		setPassword("");
	};
	const handleCreateAdmin = async () => {
		const res = await fetch("/api/auth/sign-up", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: props.email,
				username: "admin foodie",
				password: props.password,
				userType: "foodie-user",
				picture: {
					url: "",
					filename: "",
				},
			}),
		}).then((t) => t.json());
		if (res.status == "success") alert(res.message);
		else
			alert(
				"Unable to create admin account! | admin account is already created"
			);
	};
	return (
		<div className={styles.container}>
			<Head>
				<title>Foodie</title>
				<meta name="description" content="best food recipe website" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.main}>
				<h1 className={styles.title}>Welcome to F O O D I E API</h1>
				<div className={styles.message}>
					<p>{message}</p>
				</div>
				<div className={styles.form}>
					<form>
						<input
							type="text"
							name="email"
							value={email}
							placeholder="email"
							onChange={(e) => setEmail(e.target.value)}
						/>
						<input
							type="password"
							name="password"
							value={password}
							placeholder="password"
							onChange={(e) => setPassword(e.target.value)}
						/>
						<button onClick={handleSubmit} type="button">
							GET TOKEN
						</button>
					</form>
				</div>
				<button onClick={handleCreateAdmin} type="button">
					Create admin
				</button>
			</main>
		</div>
	);
}

export async function getStaticProps() {
	return {
		props: {
			email: process.env.email,
			password: process.env.password,
		},
	};
}

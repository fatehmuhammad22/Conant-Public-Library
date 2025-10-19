import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [uName, setUName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("https://localhost:7184/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uName, password })
            });

            if (!res.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await res.json();
            localStorage.setItem("username", data.uName); 
            navigate("/dashboard");
        } catch (err) {
            setError("Username or password is incorrect.");
        }
    };


    return (
        <div
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}
        >
            <div style={{ width: 420 }}>
                <h4 className="text-center mb-4">Welcome to Libraries Administration Page!</h4>
                {error && <div className="alert alert-danger py-2">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            className="form-control"
                            value={uName}
                            onChange={(e) => setUName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            className="form-control"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="btn btn-primary w-100">Login</button>
                </form>
                <div className="text-center small mt-3">
                    © 2025 Website by Belsito Communications Inc.
                </div>
            </div>
        </div>
    );
}

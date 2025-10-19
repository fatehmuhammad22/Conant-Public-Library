import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ContentLinkEditor = () => {
    const { subcategoryId } = useParams();
    const navigate = useNavigate();

    const [url, setUrl] = useState("");
    const [isOpenNewWindow, setIsOpenNewWindow] = useState(true);
    const [categoryId, setCategoryId] = useState(null);

    const fetchLinkData = async () => {
        try {
            const res = await fetch(`https://localhost:7184/api/PageLink/${subcategoryId}`);
            if (!res.ok) {
                if (res.status === 404) {
                    return;
                }
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();

            setUrl(data?.url || "");
            setIsOpenNewWindow(data?.isOpenNewWindow === 1);
            setCategoryId(data?.categoryId || null);
        } catch (err) {
            console.error("Error loading link:", err);
        }
    };

    useEffect(() => {
        if (subcategoryId) {
            fetchLinkData();
        }
    }, [subcategoryId]);

    const handleSave = () => {
        const linkData = {
            url,
            isOpenNewWindow: isOpenNewWindow ? 1 : 0,
            categoryId,
            subcategoryId
        };

        fetch(`https://localhost:7184/api/PageLink/${subcategoryId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(linkData),
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to save");
                return res.json();
            })
            .then(() => alert("Saved successfully!"))
            .catch(err => alert("Save failed: " + err.message));
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center">Conant Public Library Content Management</h2>

            <div className="events-nav">
                <a href="/dashboard" onClick={() => navigate("/dashboard")}>Back to Dashboard</a> |
                <a href="#">Link Builder</a> |
                <a href="#">Change Password</a> |
                <a href="#">Logout</a>
            </div>

            <h2 className="text-center mb-4">Change External Link</h2>

            <div className="mb-3 row">
                <label className="col-sm-2 col-form-label">URL</label>
                <div className="col-sm-10">
                    <input
                        type="text"
                        className="form-control"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                    />
                </div>
            </div>

            <div className="mb-4 row align-items-center">
                <label className="col-sm-2 col-form-label">Open link in new window</label>
                <div className="col-sm-10 d-flex gap-3">
                    <button
                        type="button"
                        className={`btn ${isOpenNewWindow ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setIsOpenNewWindow(true)}
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        className={`btn ${!isOpenNewWindow ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setIsOpenNewWindow(false)}
                    >
                        No
                    </button>
                </div>
            </div>

            <div className="text-end">
                <button className="btn btn-primary me-3" onClick={handleSave}>Save Changes</button>
                <button className="btn btn-link" onClick={() => navigate("/")}>Cancel</button>
            </div>

            <footer className="text-center mt-5">
                <hr />
                <p>© 2025 Website by Belsito Communications Inc.</p>
            </footer>
        </div>
    );
};

export default ContentLinkEditor;

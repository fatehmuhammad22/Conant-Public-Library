import React, { useEffect, useState, useRef } from "react";
import "./HomePageEditor.css";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "summernote/dist/summernote-lite.css";
import "summernote/dist/summernote-lite.js";

export default function HomePageEditor() {
    const [tiles, setTiles] = useState({});
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [fromTileCode, setFromTileCode] = useState(null);
    const [toTileCode, setToTileCode] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertBody, setAlertBody] = useState("");
    const summernoteRef = useRef(null);

    useEffect(() => {
        fetchTiles();
    }, []);

    const fetchTiles = async () => {
        try {
            const res = await fetch("https://localhost:7184/api/ContentItems/homepage");
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            const data = await res.json();

            const map = {};
            data.forEach((item) => {
                if (item.columnNo) {
                    if (!map[item.columnNo]) {
                        map[item.columnNo] = item;
                    } else if (item.orderno < map[item.columnNo].orderno) {
                        map[item.columnNo] = item;
                    }
                }
            });

            const normalizedMap = {};
            Object.entries(map).forEach(([key, item]) => {
                normalizedMap[key] = {
                    id: item.id,
                    columnno: item.columnNo,
                    title: item.title,
                    body: item.body,
                };
            });
            setTiles(normalizedMap);
        } catch (err) {
            console.error("Error loading homepage tiles:", err);
        }
    };

    const fetchAlertMessage = async () => {
        try {
            const res = await fetch("https://localhost:7184/api/Message");
            if (!res.ok) throw new Error("Failed to load alert message");
            const data = await res.json();
            setAlertBody(data?.body || "");
            setTimeout(() => {
                $(summernoteRef.current).summernote({
                    height: 200,
                    placeholder: "Write the alert message...",
                    toolbar: [
                        ["style", ["bold", "italic", "underline", "clear"]],
                        ["para", ["ul", "ol", "paragraph"]],
                        ["insert", ["link", "picture"]],
                        ["view", ["codeview"]],
                    ]
                });
                $(summernoteRef.current).summernote("code", data?.body || "");
            }, 0);
        } catch (err) {
            console.error(err);
        }
    };

    const saveAlertMessage = async () => {
        const content = $(summernoteRef.current).summernote("code");
        try {
            const res = await fetch("https://localhost:7184/api/Message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: content })
            });
            if (!res.ok) throw new Error("Failed to save alert");
            alert("Alert message saved successfully");
            setShowAlertModal(false);
        } catch (err) {
            console.error(err);
            alert("Error saving alert");
        }
    };


    const columns = [0, 1, 2, 3, 4, 5];
    const rows = ["A", "B", "C", "D", "E", "F"];

    const handleTileClick = (code) => {
        if (tiles[code]) {
            window.location.href = `/edit/${tiles[code].id}?columnno=${code}`;
        } else {
            window.location.href = `/create?columnno=${code}`;
        }
    };

    const getFirstImageSrc = (html) => {
        const match = html?.match(/<img[^>]+src="([^">]+)"/i);
        if (!match) return null;
        let src = match[1];
        if (src.startsWith("/")) {
            src = `https://localhost:7184${src}`;
        }
        return src;
    };

    const handleSaveCopy = async () => {
        if (!fromTileCode || !toTileCode) {
            alert("Please select both a source (From) and a destination (To) tile.");
            return;
        }

        const fromTile = fromTileCode;
        const toTile = toTileCode;

        if (!tiles[fromTile] || !tiles[fromTile].title) {
            alert("Selected source tile is empty. Please choose a tile with content.");
            return;
        }

        try {
            const res = await fetch("https://localhost:7184/api/ContentItems/copytile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fromTile: fromTile, 
                    toTile: toTile 
                })
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Copy failed", res.status, text);
                alert(`Copy failed: ${res.status} — ${text}`);
                return;
            }

            await fetchTiles();
            setShowCopyModal(false);
            setFromTileCode(null);
            setToTileCode(null);
        } catch (err) {
            console.error("Copy error:", err);
            alert(`Copy failed: ${err.message}`);
        }
    };




    return (
        <div className="container text-center my-4">
            <h2>Conant Public Library Content Management</h2>

            <div className="mb-3">
                <a href="/dashboard">Back to Dashboard</a> |{" "}
                <a href="/link-builder">Link Builder</a> |{" "}
                <a href="/change-password">Change Password</a> |{" "}
                <a href="/logout">Logout</a>
            </div>

            <button
                className="btn btn-warning mb-3"
                onClick={() => {
                    setShowAlertModal(true);
                    fetchAlertMessage();
                }}
            >
                Set, Edit, or Delete Alert Message
            </button>

            <p>
                The layout and content of your home page is shown below.
                <br />
                Click on a page location to edit.
            </p>

            <div className="mb-3">
                <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => window.open("/preview", "_blank")}
                >
                    Preview Home Page
                </button>

                <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => setShowCopyModal(true)}
                >
                    Copy A Tile
                </button>
            </div>

            <div className="grid-container">
                {rows.map((r) =>
                    columns.map((c) => {
                        const code = `${c}${r}`;
                        const tile = tiles[code];
                        return (
                            <div
                                key={code}
                                className={`grid-tile ${tile ? "filled" : "empty"}`}
                                onClick={() => handleTileClick(code)}
                            >
                                {tile ? (
                                    <div>
                                        {tile.title && <h6>{tile.title}</h6>}
                                        {tile.body && (() => {
                                            const src = getFirstImageSrc(tile.body);
                                            return src ? (
                                                <img src={src} alt="Image" className="img-fluid" />
                                            ) : null;
                                        })()}
                                    </div>
                                ) : (
                                    <span>{code}</span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Copy Tile Modal */}
            {showCopyModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-lg custom-wide-modal" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Copy a Tile</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowCopyModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body text-center">
                                <div className="row">
                                    {/* FROM Tiles */}
                                    <div className="col">
                                        <h6>From</h6>
                                        {rows.map(r => (
                                            <div key={r} className="d-flex justify-content-center mb-1">
                                                {columns.map(c => {
                                                    const code = `${c}${r}`;
                                                    return (
                                                        <div
                                                            key={code}
                                                            className={`copy-tile ${fromTileCode === code ? "selected-from" : ""}`}
                                                            onClick={() => setFromTileCode(code)}
                                                        >
                                                            {code}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="col-auto d-flex align-items-center">
                                        <span style={{ fontSize: "2rem" }}>→</span>
                                    </div>

                                    {/* TO Tiles */}
                                    <div className="col">
                                        <h6>To</h6>
                                        {rows.map(r => (
                                            <div key={r} className="d-flex justify-content-center mb-1">
                                                {columns.map(c => {
                                                    const code = `${c}${r}`;
                                                    return (
                                                        <div
                                                            key={code}
                                                            className={`copy-tile ${toTileCode === code ? "selected-to" : ""}`}
                                                            onClick={() => setToTileCode(code)}
                                                        >
                                                            {code}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className="mt-3 text-danger">
                                    Warning: Copying will replace any content in the "To" tile.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSaveCopy}
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCopyModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Alert Message Modal */}
            {showAlertModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Set / Edit Alert Message</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAlertModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <textarea
                                    ref={summernoteRef}
                                    defaultValue={alertBody}
                                />
                            </div>
                            <p>* To hide the alert, remove all content from the alert message</p>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={saveAlertMessage}
                                >
                                    Save Alert
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowAlertModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            <footer className="mt-3">© 2025 Website by Belsito Communications Inc.</footer>
        </div>
    );
}

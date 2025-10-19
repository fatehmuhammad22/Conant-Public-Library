import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "summernote/dist/summernote-lite.css";
import $ from "jquery";
import "summernote/dist/summernote-lite.js";
import "./HomePageEditor.css";
import { useLocation } from "react-router-dom";

export default function EditHome() {
    const [contentData, setContentData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [previewItem, setPreviewItem] = useState(null);
    const [previewAll, setPreviewAll] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const columnno = queryParams.get("columnno");

    useEffect(() => {
        const fetchHomepage = async () => {
            try {
                const res = await fetch(
                    "https://localhost:7184/api/ContentItems/homepage"
                );
                if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

                const data = await res.json();

                const filtered = columnno
                    ? data.filter(
                        (it) =>
                            (it.columnNo ?? it.ColumnNo ?? "").toString() ===
                            columnno.toString()
                    )
                    : data;

                const normalized = filtered.map((it) => ({
                    id: it.id ?? it.Id,
                    title: it.title ?? it.Title ?? "",
                    subtitle: it.subtitle ?? it.Subtitle ?? "",
                    body: it.body ?? it.Body ?? "",
                    status: it.status ?? it.Status ?? "Public",
                    order: it.orderNo ?? it.OrderNo ?? it.order ?? 0,
                    columnno: it.columnNo ?? it.ColumnNo ?? "",
                }));

                normalized.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

                setContentData(normalized);
            } catch (err) {
                console.error("Error loading content:", err);
                setContentData([]);
            }
        };

        fetchHomepage();
    }, [columnno]);

    useEffect(() => {
        if (isEditing) {
            $("#summernote").summernote({
                height: 300,
                focus: true,
                callbacks: {
                    onChange: function (contents, $editable) {
                        setSelectedItem((prev) => ({
                            ...prev,
                            body: contents,
                        }));
                    },
                },
            });

            try {
                $("#summernote").summernote("code", selectedItem?.body ?? "");
            } catch { }

            return () => {
                try {
                    $("#summernote").summernote("destroy");
                } catch { }
            };
        }
    }, [isEditing]);

    const handleEdit = (item) => {
        setSelectedItem({ ...item });
        setIsEditing(true);
    };

    const handleAddNew = () => {
        const newItem = {
            id: null,
            title: "",
            subtitle: "",
            body: "",
            status: "Public",
            order: contentData.length,
            columnno: columnno ?? "",
        };
        setSelectedItem(newItem);
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!selectedItem) return;

        const updatedBody = $("#summernote").summernote("code") ?? "";

        const payload = {
            Id: selectedItem.id,
            Title: selectedItem.title,
            Subtitle: selectedItem.subtitle,
            Body: updatedBody,
            Status: selectedItem.status || "Public",
            OrderNo: selectedItem.order ?? 0,
            ColumnNo: selectedItem.columnno ?? columnno ?? "",
        };

        try {
            if (selectedItem.id) {
                const res = await fetch(
                    `https://localhost:7184/api/ContentItems/${selectedItem.id}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
                if (!res.ok) {
                    const text = await res.text().catch(() => "");
                    throw new Error(`Failed to update: ${res.status} ${text}`);
                }
                setContentData((prev) =>
                    prev.map((it) =>
                        it.id === selectedItem.id
                            ? {
                                ...it,
                                body: updatedBody,
                                title: payload.Title,
                                subtitle: payload.Subtitle,
                                status: payload.Status,
                            }
                            : it
                    )
                );
            } else {
                const { Id, ...postPayload } = payload;

                const res = await fetch("https://localhost:7184/api/ContentItems", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(postPayload),
                });

                if (!res.ok) {
                    const txt = await res.text().catch(() => "");
                    throw new Error(`Create failed ${res.status} ${txt}`);
                }

                const created = await res.json();

                const createdNormalized = {
                    id: created.id ?? created.Id,
                    title: created.title ?? created.Title ?? postPayload.Title,
                    subtitle:
                        created.subtitle ?? created.Subtitle ?? postPayload.Subtitle,
                    body: created.body ?? created.Body ?? updatedBody,
                    status: created.status ?? created.Status ?? postPayload.Status,
                    order: created.orderNo ?? created.OrderNo ?? postPayload.OrderNo,
                    columnno: created.columnNo ?? created.ColumnNo ?? postPayload.ColumnNo,
                };

                setContentData((prev) => [...prev, createdNormalized]);
            }

            setIsEditing(false);
            setSelectedItem(null);
        } catch (err) {
            console.error("Error saving content:", err);
            alert("Save failed. Check console for details.");
        }
    };

    const handleDelete = async (id) => {

        try {
            const res = await fetch(`https://localhost:7184/api/ContentItems/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`Delete failed ${res.status}`);

            setContentData((prev) => prev.filter((it) => it.id !== id));
        } catch (err) {
            console.error("Error deleting content:", err);
            alert("Delete failed. Check console for details.");
        }
    };

    const handleOrderChange = async (id, direction) => {
        try {
            setContentData((prev) => {
                const idx = prev.findIndex((it) => it.id === id);
                if (idx < 0) return prev;

                const swapIdx = direction === "up" ? idx - 1 : idx + 1;
                if (swapIdx < 0 || swapIdx >= prev.length) return prev;

                const newData = [...prev];
                [newData[idx], newData[swapIdx]] = [newData[swapIdx], newData[idx]];

                return newData.map((it, i) => ({ ...it, order: i }));
            });

            setTimeout(async () => {
                try {
                    const updatedOrdered = [...contentData];
                    const idx = updatedOrdered.findIndex((it) => it.id === id);
                    if (idx < 0) return;

                    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
                    if (swapIdx < 0 || swapIdx >= updatedOrdered.length) return;

                    [updatedOrdered[idx], updatedOrdered[swapIdx]] = [
                        updatedOrdered[swapIdx],
                        updatedOrdered[idx],
                    ];

                    const finalOrdered = updatedOrdered.map((it, i) => ({
                        ...it,
                        order: i,
                    }));

                    await Promise.all(
                        finalOrdered.map((it) =>
                            fetch(`https://localhost:7184/api/ContentItems/${it.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    Id: it.id,
                                    Title: it.title,
                                    Subtitle: it.subtitle,
                                    Body: it.body,
                                    Status: it.status,
                                    OrderNo: it.order,
                                    ColumnNo: it.columnno ?? columnno ?? "",
                                }),
                            })
                        )
                    );
                } catch (err) {
                    console.error("Error updating order on server:", err);
                    alert("Failed to update order. See console for details.");
                }
            }, 100);
        } catch (err) {
            console.error("Error updating order locally:", err);
            alert("Failed to update order. See console for details.");
        }
    };

    const handleFieldChange = (field, value) => {
        setSelectedItem((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <>
            <div className="container text-center my-4">
                <h2>Conant Public Library Content Management</h2>
                <div className="mb-3">
                    <a href="/dashboard">Back to Dashboard</a> |{" "}
                    <a href="/link-builder">Link Builder</a> |{" "}
                    <a href="/change-password">Change Password</a> | <a href="/logout">Logout</a>
                </div>
                <p className="mb-3">
                    <strong>
                        Below are the topics that exist in section {columnno || "(all columns)"} of the home
                        page
                    </strong>
                    <br />
                    Click the Edit or Delete button as needed, or choose "Add New Content" to add a new,
                    separate topic to this page section.
                </p>
            </div>

            <div className="container mt-4">
                <table className="table table-bordered mt-3">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "150px" }}>Actions</th>
                            <th>Title</th>
                            <th>Subtitle</th>
                            <th>Status</th>
                            <th style={{ width: "100px" }}>Order</th>
                            <th style={{ width: "80px" }}>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contentData.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <button
                                        className="btn btn-sm btn-secondary me-1"
                                        onClick={() => handleEdit(item)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                                <td>{item.title}</td>
                                <td>{item.subtitle}</td>
                                <td>{item.status}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-primary me-1"
                                        onClick={() => handleOrderChange(item.id, "up")}
                                        disabled={item.order === 0}
                                    >
                                        ↑
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-primary me-1"
                                        onClick={() => handleOrderChange(item.id, "down")}
                                        disabled={item.order === contentData.length - 1}
                                    >
                                        ↓
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-outline-primary me-2"
                                        onClick={() => setPreviewItem(item)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-3">
                    <button className="btn btn-primary me-2" onClick={handleAddNew}>
                        Add New Content
                    </button>
                    <button
                        className="btn btn-outline-primary me-2"
                        onClick={() => setPreviewAll(true)}
                    >
                        Preview This Content
                    </button>
                    <button className="btn btn-secondary" onClick={() => window.history.back()}>
                        Back to Home Page Grid
                    </button>
                </div>

                {isEditing && (
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {selectedItem?.id ? `Editing: ${selectedItem.title}` : "Add New Content"}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setSelectedItem(null);
                                        }}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={selectedItem?.title ?? ""}
                                            onChange={(e) => handleFieldChange("title", e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subtitle</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={selectedItem?.subtitle ?? ""}
                                            onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            value={selectedItem?.status ?? "Public"}
                                            onChange={(e) => handleFieldChange("status", e.target.value)}
                                        >
                                            <option value="Public">Public</option>
                                            <option value="Private">Private</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Body</label>
                                        <textarea
                                            id="summernote"
                                            style={{ display: "none" }}
                                            defaultValue={selectedItem?.body ?? ""}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setSelectedItem(null);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button className="btn btn-primary" onClick={handleSave}>
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(previewItem || previewAll) && (
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Content Preview</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setPreviewItem(null);
                                            setPreviewAll(false);
                                        }}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {previewAll
                                        ? contentData.map((item) => (
                                            <div key={item.id} className="mb-4">
                                                <h3>{item.title}</h3>
                                                <h5>{item.subtitle}</h5>
                                                <div dangerouslySetInnerHTML={{ __html: item.body }}></div>
                                                <hr />
                                            </div>
                                        ))
                                        : previewItem && (
                                            <>
                                                <h3>{previewItem.title}</h3>
                                                <h5>{previewItem.subtitle}</h5>
                                                <div
                                                    dangerouslySetInnerHTML={{ __html: previewItem.body }}
                                                ></div>
                                            </>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

import React, { useEffect, useState, useRef } from "react";
import "./EventLocationManager.css";
import $ from "jquery";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
window.bootstrap = bootstrap;
import { useNavigate } from 'react-router-dom';

const EventTypeManager = () => {
    const navigate = useNavigate();
    const [types, setTypes] = useState([]);
    const [newType, setNewType] = useState({ id: 0, name: "", orderNo: null });
    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);

    const fetchTypes = async () => {
        try {
            const res = await fetch("https://localhost:7184/api/eventtypes");
            const data = await res.json();
            setTypes(data);
        } catch (err) {
            console.error("Error fetching event types:", err);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const openModal = (type = { id: 0, name: "", orderNo: null }) => {
        setNewType(type);
        if (!modalInstanceRef.current) {
            modalInstanceRef.current = new window.bootstrap.Modal(modalRef.current, {
                backdrop: 'static',
                keyboard: false
            });
        }
        modalInstanceRef.current.show();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewType((prev) => ({
            ...prev,
            [name]: name === "orderNo" ? (value ? parseInt(value) : null) : value,
        }));
    };

    const handleSave = async () => {
        const method = newType.id === 0 ? "POST" : "PUT";
        const url = `https://localhost:7184/api/eventtypes${method === "PUT" ? `/${newType.id}` : ""}`;
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newType),
            });

            if (res.ok) {
                fetchTypes();
                modalInstanceRef.current.hide();
            } else {
                alert("Failed to save event type.");
            }
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this type?")) return;
        try {
            const res = await fetch(`https://localhost:7184/api/eventtypes/${id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchTypes();
            else alert("Failed to delete event type.");
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    return (
        <div className="page-container">
            <h2 className="text-center mb-3">Conant Public Library Content Management</h2>
            <div className="events-nav">
                <a href="/dashboard" onClick={() => navigate('/dashboard')}>Back to Dashboard</a> |
                <a href="#">Link Builder</a> |
                <a href="#">Change Password</a> |
                <a href="#">Logout</a>
            </div>

            <table className="table custom-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {types.map((type) => (
                        <tr key={type.id}>
                            <td>{type.name}</td>
                            <td>
                                <button className="btn btn-outline-primary btn-sm w-75" onClick={() => openModal(type)}>Edit</button>
                            </td>
                            <td>
                                <button className="btn btn-danger btn-sm w-75" onClick={() => handleDelete(type.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-start mt-4">
                <button className="btn btn-primary add-btn" onClick={() => openModal()}>
                    Add New Event Type
                </button>
            </div>

            <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {newType.id === 0 ? "Add" : "Edit"} Event Type
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => modalInstanceRef.current.hide()}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={newType.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                            <button className="btn btn-secondary" onClick={() => modalInstanceRef.current.hide()}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="footer mt-4">© 2025 Website by Belsito Communications Inc.</footer>
        </div>
    );
};

export default EventTypeManager;

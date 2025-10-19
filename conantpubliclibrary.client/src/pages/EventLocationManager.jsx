import React, { useEffect, useState, useRef } from "react";
import "./EventLocationManager.css";
import $ from "jquery";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
window.bootstrap = bootstrap;
import { useNavigate } from 'react-router-dom';

const EventLocationManager = () => {
    const navigate = useNavigate();
    const [locations, setLocations] = useState([]);
    const [newLocation, setNewLocation] = useState({ id: 0, name: "", orderNo: null });
    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);

    const fetchLocations = async () => {
        try {
            const res = await fetch("https://localhost:7184/api/eventlocations");
            const data = await res.json();
            setLocations(data);
        } catch (err) {
            console.error("Error fetching event locations:", err);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const openModal = (location = { id: 0, name: "", orderNo: null }) => {
        setNewLocation(location);
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
        setNewLocation((prev) => ({
            ...prev,
            [name]: name === "orderNo" ? (value ? parseInt(value) : null) : value,
        }));
    };

    const handleSave = async () => {
        const method = newLocation.id === 0 ? "POST" : "PUT";
        const url = `https://localhost:7184/api/eventlocations${method === "PUT" ? `/${newLocation.id}` : ""}`;
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLocation),
            });

            if (res.ok) {
                fetchLocations();
                modalInstanceRef.current.hide();
            } else {
                alert("Failed to save location.");
            }
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this location?")) return;
        try {
            const res = await fetch(`https://localhost:7184/api/eventlocations/${id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchLocations();
            else alert("Failed to delete location.");
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
                    {locations.map((loc) => (
                        <tr key={loc.id}>
                            <td>{loc.name}</td>
                            <td>
                                <button className="btn btn-outline-primary btn-sm w-75" onClick={() => openModal(loc)}>Edit</button>
                            </td>
                            <td>
                                <button className="btn btn-danger btn-sm w-75" onClick={() => handleDelete(loc.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-start mt-4">
                <button className="btn btn-primary add-btn" onClick={() => openModal()}>
                    Add New Event Location
                </button>
            </div>

            <div
                className="modal fade"
                ref={modalRef}
                tabIndex="-1"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {newLocation.id === 0 ? "Add" : "Edit"} Event Location
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
                                    value={newLocation.name}
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

export default EventLocationManager;

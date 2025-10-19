import React, { useEffect, useState, useRef } from "react";
import "./CategoryManager.css";
import $ from "jquery";
import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
window.bootstrap = bootstrap;
import { useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';

const CategoryManager = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ id: 0, categoryName: "", orderNo: 0, isActive: true });
    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch("https://localhost:7184/api/categories");
            const data = await res.json();
            setCategories(data.sort((a, b) => a.orderNo - b.orderNo));
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openModal = (category = { id: 0, categoryName: "", orderNo: 0, isActive: true }) => {
        setNewCategory(category);
        if (!modalInstanceRef.current) {
            modalInstanceRef.current = new window.bootstrap.Modal(modalRef.current, {
                backdrop: "static",
                keyboard: false,
            });
        }
        modalInstanceRef.current.show();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewCategory((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : name === "orderNo" ? parseInt(value) : value,
        }));
    };

    const handleSave = async () => {
        const method = newCategory.id === 0 ? "POST" : "PUT";
        const url = `https://localhost:7184/api/categories${method === "PUT" ? `/${newCategory.id}` : ""}`;
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });
            if (res.ok) {
                fetchCategories();
                modalInstanceRef.current.hide();
            } else {
                alert("Failed to save category.");
            }
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            const res = await fetch(`https://localhost:7184/api/categories/${id}`, {
                method: "DELETE",
            });
            if (res.ok) fetchCategories();
            else alert("Failed to delete category.");
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const handleMove = async (currentIndex, direction) => {
        const current = categories[currentIndex];
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        const target = categories[targetIndex];

        if (!target) return;

        try {
            const res = await fetch(`https://localhost:7184/api/categories/SwapOrder?id1=${current.id}&id2=${target.id}`, {
                method: "POST"
            });

            if (res.ok) {
                fetchCategories(); 
            } else {
                alert("Failed to reorder.");
            }
        } catch (err) {
            console.error("Move error:", err);
        }
    };

    const handleEditPages = (categoryId) => {
        navigate(`/subcategory/${categoryId}`);
    };

    return (
        <div className="page-container">
            <h2 className="text-center">Conant Public Library Content Management</h2>
            <div className="events-nav">
                <a href="/dashboard" onClick={() => navigate("/dashboard")}>Back to Dashboard</a> |
                <a href="#">Link Builder</a> |
                <a href="#">Change Password</a> |
                <a href="#">Logout</a>
            </div>

            <p className="mb-4 text-center">
                <strong>These are the tabs that appear in your site's menu bar.</strong><br />
                Use this page to manage these tabs and their associated dropdowns.
            </p>

            <table className="table custom-table">
                <thead>
                    <tr>
                        <th>Current Menu Tab Text</th>
                        <th>Edit Text / Visibility</th>
                        <th>Current Order</th>
                        <th>Change Order</th>
                        <th>Shown?</th>
                        <th>Delete Entire Tab</th>
                        <th>Add / Edit Pages</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((cat, index) => (
                        <tr key={cat.id || index}>
                            <td>{cat.categoryName || "Unnamed Category"}</td>

                            <td>
                                <button
                                    className="btn btn-outline-primary btn-sm w-100"
                                    onClick={() => openModal(cat)}
                                    title="Edit Category"
                                >
                                    Edit
                                </button>
                            </td>

                            <td>{cat.orderNo ?? "-"}</td>

                            <td>
                                {index > 0 && (
                                    <button
                                        className="btn btn-sm me-1"
                                        onClick={() => handleMove(index, "up")}
                                        title="Move Up"
                                    >
                                        <i className="bi bi-arrow-up"></i>
                                    </button>
                                )}
                                {index < categories.length - 1 && (
                                    <button
                                        className="btn btn-sm"
                                        onClick={() => handleMove(index, "down")}
                                        title="Move Down"
                                    >
                                        <i className="bi bi-arrow-down"></i>
                                    </button>
                                )}
                            </td>

                            <td className={cat.isActive ? "text-success" : "text-danger"}>
                                {cat.isActive ? "Shown" : "Hidden"}
                            </td>

                            <td>
                                <button
                                    className="btn btn-danger btn-sm w-100"
                                    onClick={() => handleDelete(cat.id)}
                                    title="Delete Category"
                                >
                                    Delete
                                </button>
                            </td>

                            <td>
                                <button
                                    className="btn btn-outline-primary btn-sm w-100"
                                    onClick={() => handleEditPages(cat.id)}
                                    title="Add or Edit Pages"
                                >
                                    Add or Edit Pages
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-start mt-4">
                <button className="btn btn-primary btn-sm me-2" onClick={() => openModal()}>
                    Add New Top Level Menu Item
                </button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/')}>
                    Back to Menus
                </button>
            </div>

            <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{newCategory.id === 0 ? "Add" : "Edit"} Menu Tab</h5>
                            <button type="button" className="btn-close" onClick={() => modalInstanceRef.current.hide()}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Tab Text</label>
                                <input type="text" className="form-control" name="categoryName" value={newCategory.categoryName} onChange={handleChange} />
                            </div>
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" name="isActive" checked={newCategory.isActive} onChange={handleChange} />
                                <label className="form-check-label">Visible (Shown)</label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                            <button className="btn btn-secondary" onClick={() => modalInstanceRef.current.hide()}>Cancel</button>
                        </div> 
                    </div>
                </div>
            </div>
            <hr />
            <footer className="footer mt-4">© 2025 Website by Belsito Communications Inc.</footer>
        </div>
    );
};

export default CategoryManager;

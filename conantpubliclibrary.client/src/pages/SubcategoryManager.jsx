// imports
import React, { useEffect, useState, useRef } from 'react';
import './SubcategoryManager.css';
import { useParams, useNavigate } from 'react-router-dom';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
window.bootstrap = bootstrap;

const SubcategoryManager = () => {
    const { id: categoryId } = useParams();
    const [pages, setPages] = useState([]);
    const [pageTypes, setPageTypes] = useState([]);
    const [newPage, setNewPage] = useState({ name: '', pageTypeId: '', isActive: true });
    const [editPage, setEditPage] = useState(null);
    const [movePage, setMovePage] = useState(null);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);
    const moveModalRef = useRef(null);
    const moveModalInstance = useRef(null);

    useEffect(() => {
        fetchPages();
        fetchPageTypes();
        fetchCategories();
    }, [categoryId]);

    const fetchPages = async () => {
        try {
            const res = await fetch(`https://localhost:7184/api/Subcategories/byCategory/${categoryId}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setPages(data.sort((a, b) => a.orderNo - b.orderNo));
        } catch (err) {
            console.error('Error loading subcategories:', err);
        }
    };

    const fetchPageTypes = async () => {
        try {
            const res = await fetch('https://localhost:7184/api/PageTypes');
            if (!res.ok) throw new Error('Failed to load page types');
            const data = await res.json();
            setPageTypes(data.sort((a, b) => a.orderNo - b.orderNo));
        } catch (err) {
            console.error('Error fetching page types:', err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('https://localhost:7184/api/Categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const openAddModal = () => {
        setNewPage({ name: '', pageTypeId: '', isActive: true });
        setEditPage(null);
        showModal();
    };

    const openEditModal = (page) => {
        setEditPage({ ...page });
        showModal();
    };

    const showModal = () => {
        if (!modalInstanceRef.current) {
            modalInstanceRef.current = new window.bootstrap.Modal(modalRef.current, { backdrop: 'static', keyboard: false });
        }
        modalInstanceRef.current.show();
    };

    const handleNewPageChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewPage(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleEditPageChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditPage(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAddPage = async () => {
        const payload = {
            name: newPage.name,
            pageTypeId: parseInt(newPage.pageTypeId),
            isActive: newPage.isActive,
            categoryId: parseInt(categoryId)
        };
        try {
            const res = await fetch('https://localhost:7184/api/Subcategories/addPage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                modalInstanceRef.current.hide();
                fetchPages();
            } else {
                alert('Failed to add new page.');
            }
        } catch (err) {
            console.error('Add page error:', err);
        }
    };

    const handleSaveEdit = async () => {
        const payload = {
            ...editPage,
            pageTypeId: parseInt(editPage.pageTypeId),
            categoryId: parseInt(categoryId)
        };

        try {
            const res = await fetch(`https://localhost:7184/api/Subcategories/${editPage.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                modalInstanceRef.current.hide();
                fetchPages();
            } else {
                alert('Failed to save changes.');
            }
        } catch (err) {
            console.error('Edit error:', err);
        }
    };

    const reorderPage = async (currentIndex, direction) => {
        const current = pages[currentIndex];
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const target = pages[targetIndex];
        if (!current || !target) return;

        try {
            await fetch(`https://localhost:7184/api/Subcategories/SwapOrder?id1=${current.id}&id2=${target.id}`, {
                method: 'POST'
            });
            fetchPages();
        } catch (error) {
            console.error("Error swapping order:", error);
        }
    };

    const deletePage = async (id) => {
        await fetch(`https://localhost:7184/api/Subcategories/${id}`, { method: 'DELETE' });
        fetchPages();
    };

    const openMoveModal = (page) => {
        setMovePage({ subcategoryId: page.id, name: page.name, targetCategoryId: "" });
        if (!moveModalInstance.current) {
            moveModalInstance.current = new window.bootstrap.Modal(moveModalRef.current, { backdrop: 'static', keyboard: false });
        }
        moveModalInstance.current.show();
    };

    const handleMoveSubmit = async () => {
        if (!movePage?.targetCategoryId) return alert("Please select a target category.");

        const payload = {
            subcategoryId: movePage.subcategoryId,
            targetCategoryId: movePage.targetCategoryId
        };

        try {
            const res = await fetch(`https://localhost:7184/api/Subcategories/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                moveModalInstance.current.hide();
                fetchPages(); // Refresh current category
            } else {
                alert('Failed to move the page.');
            }
        } catch (err) {
            console.error('Error moving page:', err);
        }
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
                <strong>About the Library Menu Tab</strong><br />
                Edit page names, change page order within the dropdown, move pages to other tabs, or add new pages.
            </p>

            <table className="table custom-table">
                <thead>
                    <tr>
                        <th>Page Name</th>
                        <th>Edit</th>
                        <th>Shown?</th>
                        <th>Change Order</th>
                        <th>Move</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {pages.map((page, index) => (
                        <tr key={page.id}>
                            <td>{page.name}</td>
                            <td><button className="btn btn-outline-primary btn-sm w-100" onClick={() => openEditModal(page)}>Edit</button></td>
                            <td className={page.isActive ? "text-success" : "text-danger"}>{page.isActive ? "Shown" : "Hidden"}</td>
                            <td>
                                {index > 0 && (
                                    <button className="btn btn-sm me-1" onClick={() => reorderPage(index, 'up')} title="Move Up">
                                        <i className="bi bi-arrow-up"></i>
                                    </button>
                                )}
                                {index < pages.length - 1 && (
                                    <button className="btn btn-sm" onClick={() => reorderPage(index, 'down')} title="Move Down">
                                        <i className="bi bi-arrow-down"></i>
                                    </button>
                                )}
                            </td>
                            <td><button className="btn btn-outline-primary btn-sm w-100" onClick={() => openMoveModal(page)}>Move</button></td>
                            <td><button className="btn btn-danger btn-sm w-100" onClick={() => deletePage(page.id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-start mt-4">
                <button className="btn btn-primary btn-sm me-2" onClick={openAddModal}>Add New Page</button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/')}>Back to Menus</button>
            </div>

            <div className="modal fade" ref={modalRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{editPage ? 'Edit Page' : 'Add New Page'}</h5>
                            <button type="button" className="btn-close" onClick={() => modalInstanceRef.current.hide()}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Page Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={editPage ? editPage.name : newPage.name}
                                    onChange={editPage ? handleEditPageChange : handleNewPageChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Page Type</label>
                                <select
                                    className="form-select"
                                    name="pageTypeId"
                                    value={editPage ? editPage.pageTypeId : newPage.pageTypeId}
                                    onChange={editPage ? handleEditPageChange : handleNewPageChange}
                                >
                                    <option value="">Select Page Type</option>
                                    {pageTypes.map((pt) => (
                                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-check mb-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    name="isActive"
                                    checked={editPage ? editPage.isActive : newPage.isActive}
                                    onChange={editPage ? handleEditPageChange : handleNewPageChange}
                                />
                                <label className="form-check-label">Visible (Shown)</label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={editPage ? handleSaveEdit : handleAddPage}>Save</button>
                            <button className="btn btn-secondary" onClick={() => modalInstanceRef.current.hide()}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" ref={moveModalRef} tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Move '{movePage?.name}' To Different Menu Category</h5>
                            <button type="button" className="btn-close" onClick={() => moveModalInstance.current.hide()}></button>
                        </div>
                        <div className="modal-body">
                            <label className="form-label">Select Destination Menu Category</label>
                            <select
                                className="form-select"
                                value={movePage?.targetCategoryId || ''}
                                onChange={(e) =>
                                    setMovePage((prev) => ({
                                        ...prev,
                                        targetCategoryId: parseInt(e.target.value),
                                    }))
                                }
                            >
                                <option value="">Select Category</option>
                                {categories.filter(c => c.id !== parseInt(categoryId)).map(c => (
                                    <option key={c.id} value={c.id}>{c.categoryName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={handleMoveSubmit}>Move</button>
                            <button className="btn btn-secondary" onClick={() => moveModalInstance.current.hide()}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <footer className="footer mt-4">© 2025 Website by Belsito Communications Inc.</footer>
        </div>
    );
};

export default SubcategoryManager;

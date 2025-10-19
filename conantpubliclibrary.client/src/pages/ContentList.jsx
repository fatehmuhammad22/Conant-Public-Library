import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import $ from "jquery";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "summernote/dist/summernote-lite.css";
import "summernote/dist/summernote-lite.js";
import "./summernote-overrides.css";

export default function ContentList() {
    const { subcategoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const modalRef = useRef(null);
    const [subcategories, setSubcategories] = useState([]);
    const [selectedContentId, setSelectedContentId] = useState(null);
    const [newSubcategoryId, setNewSubcategoryId] = useState("");
    const [contentItems, setContentItems] = useState([]);
    const [subcategoryName, setSubcategoryName] = useState("");
    const [categoryId, setCategoryId] = useState(null);
    const [previewContent, setPreviewContent] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [newContent, setNewContent] = useState({
        title: "",
        subtitle: "",
        body: "",
        isPublic: true
    });

    const fetchSubcategories = async () => {
    try {
        const res = await fetch("https://localhost:7184/api/subcategories");
        const data = await res.json();
        setSubcategories(data.filter(sc => sc.id !== parseInt(subcategoryId)));
    } catch (err) {
        console.error("Failed to fetch subcategories", err);
    }
};
    useEffect(() => {
        const fetchSubcategory = async () => {
            try {
                const res = await fetch(`https://localhost:7184/api/subcategories/${subcategoryId}`);
                const data = await res.json();
                setSubcategoryName(data.name);
                setCategoryId(data.categoryId); 
                fetchSubcategoryList(data.categoryId);
            } catch (err) {
                console.error("Error fetching subcategory:", err);
            }
        };

        const fetchContent = async () => {
            try {
                const res = await fetch(`https://localhost:7184/api/contentitems/by-subcategory/${subcategoryId}`);
                const data = await res.json();
                setContentItems(data);
            } catch (err) {
                console.error("Error fetching content items:", err);
            }
        };

        const fetchSubcategoryList = async (catId) => {
            try {
                const res = await fetch(`https://localhost:7184/api/subcategories/by-category/${catId}`);
                const data = await res.json();
                setSubcategories(data);
            } catch (err) {
                console.error("Error fetching subcategories:", err);
            }
        };

        if (subcategoryId) {
            if (location.state && location.state.categoryId && location.state.subcategoryName) {
                setCategoryId(location.state.categoryId);
                setSubcategoryName(location.state.subcategoryName);
                fetchSubcategoryList(location.state.categoryId); 
            } else {
                fetchSubcategory(); 
            }

            fetchContent();
        }
    }, [subcategoryId, location.state]);



    const initializeSummernote = (content = "") => {
        if ($('#summernoteContent').next().hasClass('note-editor')) {
            $('#summernoteContent').summernote('destroy');
        }

        $('#summernoteContent').summernote({
            height: 300,
            placeholder: 'Write your content...',
            fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '24', '36'],
            toolbar: [
                ['style', ['style', 'bold', 'italic', 'underline', 'clear']],
                ['font', ['fontsize', 'strikethrough', 'superscript', 'subscript']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['insert', ['link', 'picture', 'video', 'table']],
                ['custom', ['copywriteBtn', 'bootstrapBtn', 'docUploader', 'imageToLink']],
                ['misc', ['undo', 'redo', 'fullscreen', 'codeview']]
            ],
            buttons: {
                copywriteBtn: () => $.summernote.ui.button({
                    contents: '<i class="bi bi-c-circle"></i>',
                    tooltip: 'Insert ©',
                    click: () => $('#summernoteContent').summernote('pasteHTML', '©')
                }).render(),
                bootstrapBtn: () => $.summernote.ui.button({
                    contents: '<i class="bi bi-bootstrap"></i>',
                    tooltip: 'Insert Bootstrap Button',
                    click: () => $('#summernoteContent').summernote('pasteHTML', '<button class="btn btn-primary">Click Me</button>')
                }).render(),
                docUploader: () => $.summernote.ui.button({
                    contents: '<i class="bi bi-upload"></i>',
                    tooltip: 'Upload Document',
                    click: () => alert("Document uploader logic goes here.")
                }).render(),
                imageToLink: () => $.summernote.ui.button({
                    contents: '<i class="bi bi-link-45deg"></i>',
                    tooltip: 'Convert Image to Link',
                    click: () => alert("Convert image to link logic goes here.")
                }).render()
            },
            callbacks: {
                onChange: function (contents) {
                    setNewContent(prev => ({ ...prev, body: contents }));
                }
            }
        });

        $('#summernoteContent').summernote('code', content);
        $('#summernoteContent').summernote('fontSize', 16);
    };

    const openAddModal = () => {
        setEditingItemId(null);
        setNewContent({ title: "", subtitle: "", body: "", isPublic: true });
        initializeSummernote('');
        new bootstrap.Modal(document.getElementById('addContentModal')).show();
    };

    const openEditModal = (item) => {
        setEditingItemId(item.id);
        setNewContent({
            title: item.title,
            subtitle: item.subtitle,
            body: item.body,
            isPublic: item.isPublic
        });
        initializeSummernote(item.body);
        new bootstrap.Modal(document.getElementById('addContentModal')).show();
    };

    const getNextId = () => {
        const ids = contentItems.map(item => item.id);
        return ids.length ? Math.max(...ids) + 1 : 1;
    };

    const openMoveModal = (contentId) => {
        setSelectedContentId(contentId);
        setNewSubcategoryId("");
        fetchSubcategories();
        new bootstrap.Modal(document.getElementById("moveModal")).show();
    };

    const handleMoveSubmit = async () => {
        if (!selectedContentId || !newSubcategoryId) {
            alert("Please select a subcategory.");
            return;
        }

        try {
            const res = await fetch(`https://localhost:7184/api/contentitems/${selectedContentId}/move`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newSubcategoryId: parseInt(newSubcategoryId) })
            });

            if (res.ok) {
                bootstrap.Modal.getInstance(document.getElementById("moveModal"))?.hide();
                const updated = await fetch(`https://localhost:7184/api/contentitems/by-subcategory/${subcategoryId}`);
                const data = await updated.json();
                setContentItems(data);
            } else {
                alert("Move failed.");
            }
        } catch (err) {
            console.error("Move error:", err);
        }
    };


    const handleSave = async () => {

        const method = editingItemId ? "PUT" : "POST";
        const url = editingItemId
            ? `https://localhost:7184/api/contentitems/${editingItemId}`
            : `https://localhost:7184/api/contentitems`;

        const bodyToSend = {
            id: editingItemId || getNextId(),
            title: newContent.title || "",
            subtitle: newContent.subtitle || "",
            body: newContent.body || "",
            subcategoryId: parseInt(subcategoryId),
            categoryId: categoryId || 0, 
            columnNo: "",
            status: newContent.isPublic ? "Public" : "Draft",
            orderNo: contentItems.length + 1,
            createdOn: new Date().toISOString()
        };

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyToSend)
        });

        if (res.ok) {
            const updated = await fetch(`https://localhost:7184/api/contentitems/by-subcategory/${subcategoryId}`);
            const data = await updated.json();
            setContentItems(data);
            bootstrap.Modal.getInstance(document.getElementById("addContentModal"))?.hide();
        } else {
            const errorText = await res.text();
            alert("Failed to save content.\n" + errorText);
        }
    };


    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this content?")) return;

        const res = await fetch(`https://localhost:7184/api/contentitems/${id}`, { method: "DELETE" });

        if (res.ok) {
            const updated = await fetch(`https://localhost:7184/api/contentitems/by-subcategory/${subcategoryId}`);
            const data = await updated.json();
            setContentItems(data);
        } else {
            alert("Failed to delete content.");
        }
    };

    const handleMove = async (currentIndex, direction) => {
        const current = contentItems[currentIndex];
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        const target = contentItems[targetIndex];

        if (!target) return;

        try {
            const res = await fetch(`https://localhost:7184/api/contentitems/SwapOrder?id1=${current.id}&id2=${target.id}`, {
                method: "POST"
            });

            if (res.ok) {
                const updated = await fetch(`https://localhost:7184/api/contentitems/by-subcategory/${subcategoryId}`);
                const data = await updated.json();
                setContentItems(data);
            } else {
                alert("Failed to reorder.");
            }
        } catch (err) {
            console.error("Move error:", err);
        }
    };


    return (
        <div className="events-container">
            <h2 className="text-center">Conant Public Library Content Management</h2>

            <div className="events-nav">
                <a href="/dashboard" onClick={() => navigate("/dashboard")}>Back to Dashboard</a> |
                <a href="#">Link Builder</a> |
                <a href="#">Change Password</a> |
                <a href="#">Logout</a>
            </div>

            <p className="mb-4 text-center">
                <strong>These are the topics that exist on the '{subcategoryName}' page or the selected area.</strong>
            </p>

            <table className="table custom-table">
                <thead>
                    <tr>
                        <th>Actions</th>
                        <th>Title</th>
                        <th>Subtitle</th>
                        <th>Status</th>
                        <th>Order</th>
                        <th>Move topic to a different page</th>
                        <th>View</th>
                    </tr>
                </thead>
                <tbody>
                    {contentItems.map((item, index) => (
                        <tr key={item.id}>
                            <td>
                                <button className="btn btn-outline-primary btn-sm me-1" onClick={() => openEditModal(item)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                            </td>
                            <td>{item.title}</td>
                            <td>{item.subtitle || "-"}</td>
                            <td>{item.status}</td>
                            <td>
                                {index > 0 && (
                                    <button className="btn btn-sm me-1" onClick={() => handleMove(index, "up")}>
                                        <i className="bi bi-arrow-up"></i>
                                    </button>
                                )}
                                {index < contentItems.length - 1 && (
                                    <button className="btn btn-sm" onClick={() => handleMove(index, "down")}>
                                        <i className="bi bi-arrow-down"></i>
                                    </button>
                                )}
                            </td>
                            <td>
                                <button className="btn btn-outline-primary btn-sm" onClick={() => openMoveModal(item.id)}>
                                    Move
                                </button>
                            </td>
                            <td>
                                <button className="btn btn-outline-primary btn-sm" onClick={() => {
                                    setPreviewContent(item);
                                    new bootstrap.Modal(document.getElementById("viewContentModal")).show();
                                }}>
                                    View
                                </button>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-start mt-4">
                <button className="btn btn-primary btn-sm me-2" onClick={openAddModal}>Add New Content</button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => {
                    new bootstrap.Modal(document.getElementById("previewPageModal")).show();
                }}>
                    Preview This Page
                </button>
            </div>

            <hr />
            <footer className="footer mt-4">© 2025 Website by Belsito Communications Inc.</footer>

            <div className="modal fade" id="addContentModal" tabIndex="-1" ref={modalRef} aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{editingItemId ? 'Edit Content' : 'Add New Content'}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Title</label>
                                <input type="text" className="form-control"
                                    value={newContent.title}
                                    onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Subtitle</label>
                                <input type="text" className="form-control"
                                    value={newContent.subtitle}
                                    onChange={(e) => setNewContent(prev => ({ ...prev, subtitle: e.target.value }))} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Body</label>
                                <textarea id="summernoteContent"></textarea>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="isPublicCheck"
                                    checked={newContent.isPublic}
                                    onChange={(e) => setNewContent(prev => ({ ...prev, isPublic: e.target.checked }))} />
                                <label className="form-check-label" htmlFor="isPublicCheck">
                                    Make Public
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editingItemId ? 'Save Changes' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="moveModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Move Content to Another Page</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <label className="form-label">Select Page</label>
                            <select className="form-select" value={newSubcategoryId} onChange={(e) => setNewSubcategoryId(e.target.value)}>
                                <option value="">-- Select --</option>
                                {subcategories.map(sc => (
                                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button className="btn btn-primary" onClick={handleMoveSubmit}>Move</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="viewContentModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{previewContent?.title}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <h6 className="text-muted">{previewContent?.subtitle}</h6>
                            <div dangerouslySetInnerHTML={{ __html: previewContent?.body }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="previewPageModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Preview: {subcategoryName}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {contentItems.length === 0 ? (
                                <p>No content available.</p>
                            ) : (
                                contentItems.map((item, index) => (
                                    <div key={index} className="mb-5">
                                        <h4>{item.title}</h4>
                                        <h6 className="text-muted">{item.subtitle}</h6>
                                        <div dangerouslySetInnerHTML={{ __html: item.body }} />
                                        <hr />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

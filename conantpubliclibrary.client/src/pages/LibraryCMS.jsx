import React, { useState, useEffect } from 'react';
import './LibraryCMS.css';
import { useNavigate } from 'react-router-dom';

const LibraryCMS = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
    const [activePanel, setActivePanel] = useState('content');

    const [showModal, setShowModal] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changePwdError, setChangePwdError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchCategories = async () => {
        try {
            const res = await fetch("https://localhost:7184/api/categories");
            const data = await res.json();
            setCategories(data.sort((a, b) => a.orderNo - b.orderNo));
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const fetchSubcategories = async (categoryId) => {
        try {
            const res = await fetch(`https://localhost:7184/api/subcategories/byCategory/${categoryId}`);
            const data = await res.json();
            setSubcategories(data.sort((a, b) => a.orderNo - b.orderNo));
        } catch (err) {
            console.error("Error fetching subcategories:", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchSubcategories(selectedCategoryId);
        } else {
            setSubcategories([]);
        }
    }, [selectedCategoryId]);

    const [currentUsername, setCurrentUsername] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("username");
        if (storedUser) {
            setCurrentUsername(storedUser);
        } else {
            navigate("/");
        }
    }, [navigate]);


    const handleChangePassword = async () => {
        setChangePwdError('');
        setSuccessMsg('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setChangePwdError("All fields are required");
            return;
        }
        if (newPassword !== confirmPassword) {
            setChangePwdError("New passwords do not match");
            return;
        }

        try {
            const res = await fetch("https://localhost:7184/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uName: currentUsername,
                    oldPassword,
                    newPassword
                })
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || "Failed to update password");
            }

            setSuccessMsg("Password updated successfully!");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setChangePwdError(err.message);
        }
    };

    return (
        <div className="cms-container">
            <h2 className="cms-header">Conant Public Library Content Management</h2>
            <div className="cms-nav-links">
                <a href="#/dashboard">Back to Dashboard</a> |
                <a href="#">Link Builder</a> |
                <a href="#" onClick={(e) => { e.preventDefault(); setShowModal(true); }}>Change Password</a> |
                <a href="#/" onClick={() => navigate('/')}>Logout</a>
            </div>

            <div className="cms-top-buttons">
                <button
                    className={`btn-main ${activePanel === 'content' ? 'active' : ''}`}
                    onClick={() => setActivePanel('content')}
                >
                    Manage the Content on Your Website Pages
                </button>
                <button
                    className={`btn-main ${activePanel === 'menu' ? 'active' : ''}`}
                    onClick={() => setActivePanel('menu')}
                >
                    Manage the Menu Bar and Associated Pages
                </button>
            </div>

            <hr className="cms-divider" />

            {activePanel === 'content' && (
                <div className="cms-panels">
                    <div className="panel">
                        <h4>Edit Web Page Content</h4>
                        <hr/>
                        <button className="btn-blue" onClick={() => navigate('/HomePage-Editor')}>Edit Home Page</button>
                        <button className="btn-blue" onClick={() => navigate('/Top-Ribbon-Editor')}>
                            Edit Custom Top Ribbon
                        </button>
                        <button className="btn-blue" onClick={() => navigate('/Footer-Editor')}>
                            Edit Custom Footer
                        </button>
                        <hr />
                        <h6 className="or-divider">OR</h6>
                        <h5 className="instruction">
                            Edit An Interior Page
                        </h5>
                        <p><i>Select menu tab, then specific page...</i></p>

                        <select
                            className="dropdown"
                            value={selectedCategoryId}
                            onChange={(e) => {
                                setSelectedCategoryId(e.target.value);
                                setSelectedSubcategoryId('');
                            }}
                        >
                            <option value="">Select Menu Tab</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.categoryName}
                                </option>
                            ))}
                        </select>

                        <select
                            className="dropdown"
                            value={selectedSubcategoryId}
                            onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                            disabled={!selectedCategoryId}
                        >
                            <option value="">-- Select --</option>
                            {subcategories.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>

                        <button
                            className="btn-blue"
                            onClick={async () => {
                                if (!selectedSubcategoryId) {
                                    alert('Please select a subcategory.');
                                    return;
                                }

                                try {
                                    const res = await fetch(`https://localhost:7184/api/contentitems/pageinfo/${selectedSubcategoryId}`);
                                    if (!res.ok) throw new Error("Not found");

                                    const data = await res.json();
                                    const { pageTypeId, subcategoryName, categoryId } = data;

                                    let route;
                                    switch (pageTypeId) {
                                        case "ContentList":
                                            route = "/Interior-Page-Editor";
                                            break;
                                        case "ContentLink":
                                            route = "/Link-Page-Editor";
                                            break;
                                        case "ContentCalendar":
                                            route = "/Calendar-Page-Editor";
                                            break;
                                        default:
                                            alert(`Unsupported Page Type: ${pageTypeId}`);
                                            return;
                                    }

                                    navigate(`${route}/${selectedSubcategoryId}`, {
                                        state: {
                                            categoryId,
                                            subcategoryName,
                                            subcategoryId: selectedSubcategoryId 
                                        }
                                    });
                                } catch (err) {
                                    console.error(err);
                                    alert("Failed to load page info.");
                                }
                            }}
                        >
                            Edit Interior Page
                        </button>

                    </div>

                    <div className="panel">
                        <h4>Edit Event Calendars</h4>
                        <hr />
                        <button className="btn-gold" onClick={() => navigate('/Events-Editor')}>
                            Add / Edit / Delete Events
                        </button>
                        <hr />
                        <div className="calendar-tasks">
                            <h6><strong>Calendar Setup Tasks</strong></h6>
                            <button className="btn-gold" onClick={() => navigate('/Event-Type-Manager')}>
                                Set Event Type Options
                            </button>
                            <button className="btn-gold" onClick={() => navigate('/Event-Location-Manager')}>
                                Set Event Location Options
                            </button>
                        </div>
                        <hr />
                        <div className="calendar-tasks">
                            <h6><strong>Export Calendar Events</strong></h6>
                            <button
                                className="btn-gold"
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = '/CalendarItem.ics';
                                    link.download = 'CalendarItem.ics';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                            >
                                Export as .ics File
                            </button>

                        </div>
                    </div>

                    <div className="panel">
                        <h4>Help Files</h4>
                        <hr />
                        <p>Help Files</p>
                    </div>
                </div>
            )}

            {activePanel === 'menu' && (
                <div className="cms-menu-panel">
                    <p className="menu-instructions">
                        This section is not used to edit the actual content of your site. Instead, it allows you to manage the site's menu bar,
                        and to add or delete pages on your site. To edit actual page content, click the link above that reads
                         "Manage the Content on Your Website Pages".
                    </p>

                    <div className="cms-panels">
                        <div className="panel">
                            <h4>Manage Website Menu Bar</h4>
                            <hr />
                            <p>Add, Edit, or Delete top level menu tabs and their associated dropdowns.</p>
                            <button className="btn-green" onClick={() => navigate('/Category-Manager')}>
                                Edit Menu Bar
                            </button>
                        </div>

                        <div className="panel">
                            <h4>Manage 'Standalone' Pages</h4>
                            <hr />
                            <p>Add, Edit, or Delete pages that are not listed in the site's navigational menu.</p>
                            <button className="btn-green" onClick={() => navigate('/subcategory/61201')}>
                                Edit Standalone Pages
                            </button>
                        </div>

                        <div className="panel">
                            <h4>Help Files</h4>
                            <hr />
                            <p>Help Files</p>
                        </div>
                    </div>
                </div>
            )}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Change Password</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                {changePwdError && <div className="alert alert-danger">{changePwdError}</div>}
                                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                                <div className="mb-3">
                                    <label style={{ textAlign: "left", display: "block", color: "#000" }}>
                                        Old Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label style={{ textAlign: "left", display: "block", color: "#000" }}>
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label style={{ textAlign: "left", display: "block", color: "#000" }}>
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleChangePassword}>Update Password</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <hr />
            <footer className="footer">© 2025 Website by Belsito Communications Inc.</footer>
        </div>
    );
};

export default LibraryCMS;
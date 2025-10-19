import React, { useEffect, useState } from 'react';
import './TopRibbonEditor.css';
import { useNavigate } from 'react-router-dom';

import $ from 'jquery';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
window.bootstrap = bootstrap;

import 'bootstrap/dist/css/bootstrap.min.css';
import 'summernote/dist/summernote-lite.js';
import 'summernote/dist/summernote-lite.css';


const TopRibbonEditor = () => {
    const navigate = useNavigate();
    const [ribbonData, setRibbonData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewFilter, setPreviewFilter] = useState('Public');
    const modalRef = React.useRef(null);
    const modalInstanceRef = React.useRef(null);

    useEffect(() => {
        fetchTopRibbon();
    }, []);

    const fetchTopRibbon = async () => {
        try {
            const response = await fetch('https://localhost:7184/api/topribbon');
            const data = await response.json();
            setRibbonData(data);
        } catch (error) {
            console.error('Error fetching top ribbon:', error);
        }
    };

    function generateUUID() {
        var d = new Date().getTime();
        var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16;
            if (d > 0) {
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    const openEditor = (item) => {
        setSelectedItem(item);
        setTimeout(() => {
            if ($('#summernote-top').next().hasClass('note-editor')) {
                $('#summernote-top').summernote('destroy');
            }

            const customButton = (context) => {
                var ui = $.summernote.ui;
                return ui.button({
                    contents: '<i class="note-icon-pencil"/> CopyWrite',
                    tooltip: 'Insert Copywrite Symbol',
                    click: function () {
                        context.invoke('editor.insertText', '© Custom Text');
                    }
                }).render();
            };

            const bootstrapButton = (context) => {
                var ui = $.summernote.ui;
                return ui.button({
                    contents: '<i class="note-icon-cog"/> Bootstrap Button',
                    tooltip: 'Insert Bootstrap Button',
                    click: function () {
                        context.invoke('editor.pasteHTML', '<a type="button" class="btn btn-primary">Click Me!</a>');
                    }
                }).render();
            };

            const documentUploader = (context) => {
                var ui = $.summernote.ui;
                return ui.button({
                    contents: '<i class="note-icon-paperclip"/> Upload Document',
                    tooltip: 'Upload Document',
                    click: function () {
                        const fileInput = $('<input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" style="display: none;">');
                        fileInput.on('change', function (event) {
                            const file = event.target.files[0];
                            if (file) {
                                const fileData = new FormData();
                                const docid = generateUUID();
                                const ext = file.name.substring(file.name.lastIndexOf("."));
                                fileData.append(file.name, file);
                                fileData.append("docid", docid);
                                fileData.append("ext", ext);
                                $.ajax({
                                    url: '/handler.asmx/fileupload',
                                    type: "POST",
                                    contentType: false,
                                    processData: false,
                                    data: fileData,
                                    success: function () {
                                        const filename = docid + ext;
                                        const fileURL = "/resources/documents/" + filename;
                                        context.invoke('editor.createLink', { text: file.name, url: fileURL });
                                    },
                                    error: function (err) {
                                        alert(err.statusText);
                                    }
                                });
                            }
                        });
                        fileInput.click();
                    }
                }).render();
            };

            const imageToLinkButton = (context) => {
                var ui = $.summernote.ui;
                return ui.button({
                    contents: '<i class="note-icon-link"/> Image to Link',
                    tooltip: 'Turn Image into Link',
                    click: function () {
                        alert("Image to Link button clicked");
                    }
                }).render();
            };

            $('#summernote-top').summernote({
                placeholder: 'Edit footer content here...',
                tabsize: 2,
                height: 300,
                focus: true,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
                    ['fontname', ['fontname']],
                    ['fontsize', ['fontsize']],
                    ['color', ['color', 'backcolor']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['insert', ['link', 'picture', 'video', 'table', 'hr']],
                    ['view', ['fullscreen', 'codeview', 'help']],
                    ['align', ['left', 'center', 'right', 'justify']],
                    ['misc', ['undo', 'redo']],
                    ['custom', ['customButton', 'bootstrapButton', 'documentUploader', 'imageToLinkButton']]
                ],
                buttons: {
                    customButton: customButton,
                    bootstrapButton: bootstrapButton,
                    documentUploader: documentUploader,
                    imageToLinkButton: imageToLinkButton
                },
                callbacks: {
                    onImageUpload: function (files) {
                        const file = files[0];
                        const formData = new FormData();
                        const filename = generateUUID() + '.' + file.name.split('.').pop();
                        formData.append('image', file);
                        formData.append('filename', filename);

                        $.ajax({
                            url: 'https://localhost:7184/api/FileUpload',
                            method: 'POST',
                            data: formData,
                            processData: false,
                            contentType: false,
                            success: function () {
                                const imageUrl = `https://localhost:7184/resources/images/${filename}`;
                                $('#summernote-top').summernote('insertImage', imageUrl, function ($image) {
                                    $image.attr('alt', filename);
                                    $image.css('max-width', '100%');
                                });
                            },
                            error: function () {
                                alert("Image upload failed.");
                            }
                        });
                    }
                }
            });

            $('#summernote-top').summernote('code', item.body);

            if (!modalInstanceRef.current) {
                modalInstanceRef.current = new window.bootstrap.Modal(modalRef.current);
            }
            modalInstanceRef.current.show();
        }, 100);
    };

    const handleSave = async () => {
        const updatedContent = $('#summernote-top').summernote('code');
        try {
            const response = await fetch(`https://localhost:7184/api/topribbon/${selectedItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...selectedItem, body: updatedContent })
            });

            if (response.ok) {
                alert("Changes saved successfully!");
                handleClose();
                fetchTopRibbon();
            } else {
                alert("Failed to save changes.");
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            alert("An error occurred.");
        }
    };

    const handleClose = () => {
        $('#summernote-top').summernote('destroy');
        const modalEl = document.getElementById('topRibbonModal');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        bsModal.hide();
        setSelectedItem(null);
    };

    const filteredRibbonData = ribbonData.filter(item => {
        if (previewFilter === 'Both') return true;
        return item.status === previewFilter;
    });

    const openPreviewModal = () => {
        const modalEl = document.getElementById('previewModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        setShowPreviewModal(true);
    };

    return (
        <div className="ribbon-container">
            <h2 className="ribbon-header">Conant Public Library Content Management</h2>
            <div className="ribbon-nav">
                <a href="/dashboard" onClick={() => navigate('/dashboard')}>Back to Dashboard</a> |
                <a href="#">Link Builder</a> |
                <a href="#">Change Password</a> |
                <a href="#">Logout</a>
            </div>

            <p className="ribbon-description">The layout and content of your top ribbon is shown below.</p>
            <p className="ribbon-click-note">Click on a page location to edit.</p>

            <button className="preview-btn" onClick={openPreviewModal}>Preview Top Ribbon</button>

            <div className="ribbon-grid">
                {ribbonData.map(item => (
                    <div
                        key={item.id}
                        className="ribbon-box"
                        onClick={() => openEditor(item)}
                    >
                        <div
                            className="ribbon-box-inner"
                            dangerouslySetInnerHTML={{
                                __html: item.body.replace(/src="\/resources\/images/g, 'src="https://localhost:7184/resources/images')
                            }}
                        />
                    </div>
                ))}
            </div>

            <div className="modal fade" id="topRibbonModal" tabIndex="-1" role="dialog" aria-labelledby="topRibbonModalLabel" aria-hidden="true" ref={modalRef}>
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="topRibbonModalLabel">Edit Top Ribbon Content</h5>
                            <button type="button" className="close" onClick={handleClose}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div id="summernote-top"></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                            <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="previewModal" tabIndex="-1" aria-labelledby="previewModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="previewModalLabel">Preview</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body text-center">
                            <div className="mb-3 d-flex justify-content-center gap-4">
                                <button className={`btn ${previewFilter === 'Public' ? 'btn-primary' : 'btn-link'}`} onClick={() => setPreviewFilter('Public')}>Public Items Only</button>
                                <button className={`btn ${previewFilter === 'Preview' ? 'btn-primary' : 'btn-link'}`} onClick={() => setPreviewFilter('Preview')}>Preview Items Only</button>
                                <button className={`btn ${previewFilter === 'Both' ? 'btn-primary' : 'btn-link'}`} onClick={() => setPreviewFilter('Both')}>Both</button>
                            </div>
                            <div className="ribbon-preview-wrapper w-100">
                                <div className="top-ribbon-preview d-flex justify-content-between align-items-center flex-wrap">
                                    {filteredRibbonData.map((item, index) => (
                                        <div key={index} className="ribbon-preview-section px-3"
                                            dangerouslySetInnerHTML={{
                                                __html: item.body.replace(/src="\/resources\/images/g, 'src="https://localhost:7184/resources/images')
                                            }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="footer">© 2025 Website by Belsito Communications Inc.</footer>
        </div>
    );
};

export default TopRibbonEditor;

import React, { useEffect, useRef, useState } from 'react';
import './TopRibbonEditor.css';
import { useNavigate } from 'react-router-dom';

import $ from 'jquery';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
window.bootstrap = bootstrap;

import 'bootstrap/dist/css/bootstrap.min.css';
import 'summernote/dist/summernote-lite.js';
import 'summernote/dist/summernote-lite.css';

const FooterEditor = () => {
    const navigate = useNavigate();
    const [footerData, setFooterData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewFilter, setPreviewFilter] = useState('Public');


    useEffect(() => {
        fetchFooter();
    }, []);

    const fetchFooter = async () => {
        try {
            const response = await fetch('https://localhost:7184/api/BottomFooter');
            const data = await response.json();
            console.log("Raw Footer Data:", data);
            setFooterData(data);
        } catch (error) {
            console.error('Error fetching footer data:', error);
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
            if ($('#summernote').next().hasClass('note-editor')) {
                $('#summernote').summernote('destroy');
            }

            const customButton = function (context) {
                var ui = $.summernote.ui;
                return ui.button({
                    contents: '<i class="note-icon-pencil"/> CopyWrite',
                    tooltip: 'Insert Copywrite Symbol',
                    click: function () {
                        context.invoke('editor.insertText', '© Custom Text');
                    }
                }).render();
            };

            const bootstrapButton = function (context) {
                var ui = $.summernote.ui;
                return ui.button({
                    contents: '<i class="note-icon-cog"/> Bootstrap Button',
                    tooltip: 'Insert Bootstrap Button',
                    click: function () {
                        context.invoke('editor.pasteHTML', '<a type="button" class="btn btn-primary">Click Me!</a>');
                    }
                }).render();
            };

            const documentUploader = function (context) {
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

            const imageToLinkButton = function (context) {
                var ui = $.summernote.ui;
                return ui.button({
                    contents: '<i class="note-icon-link"/> Image to Link',
                    tooltip: 'Turn Image into Link',
                    click: function () {
                        alert("Image to Link button clicked");
                    }
                }).render();
            };

            $('#summernote').summernote({
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
                                $('#summernote').summernote('insertImage', imageUrl, function ($image) {
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

            $('#summernote').summernote('code', item.body);

            if (!modalInstanceRef.current) {
                modalInstanceRef.current = new window.bootstrap.Modal(modalRef.current);
            }
            modalInstanceRef.current.show();
        }, 100);
    };

    const cleanHtml = (html) => {
        html = html.replace(/<p[^>]*style="[^"]*text-align:\s*center;?[^"]*"[^>]*>/gi, '<p>');
        html = html.replace(
            /<img[^>]+src="data:image\/[^;]+;base64[^"]+"[^>]*>/gi,
            (match) => `<a href="http://">${match}</a>`
        );
        return html;
    };



    const handleSave = async () => {
        let updatedContent = $('#summernote').summernote('code');
        updatedContent = cleanHtml(updatedContent); 

        try {
            const response = await fetch(`https://localhost:7184/api/BottomFooter/${selectedItem.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...selectedItem, body: updatedContent })
            });

            if (response.ok) {
                alert("Changes saved successfully!");
                handleClose();
                fetchFooter();
            } else {
                alert("Failed to save changes.");
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            alert("An error occurred.");
        }
    };


    const handleClose = () => {
        $('#summernote').summernote('destroy');
        if (modalInstanceRef.current) {
            modalInstanceRef.current.hide();
        }
        setSelectedItem(null);
    };

    const filteredFooterData = footerData.filter(item => {
        if (previewFilter === 'Both') return true;
        return item.status === previewFilter;
    });

    const previewModalRef = useRef(null);
    const previewModalInstanceRef = useRef(null);

    const openPreviewModal = () => {
        if (!previewModalInstanceRef.current) {
            previewModalInstanceRef.current = new window.bootstrap.Modal(previewModalRef.current);
        }
        previewModalInstanceRef.current.show();
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

            <p className="ribbon-description">The layout and content of your footer is shown below.</p>
            <p className="ribbon-click-note">Click on a box to edit.</p>

            <button className="preview-btn" onClick={openPreviewModal}>Preview Footer</button>

            <div className="ribbon-grid">
                {footerData.map(item => (
                    <div
                        key={item.id}
                        className="ribbon-box"
                        onClick={() => openEditor(item)}
                        dangerouslySetInnerHTML={{
                            __html: item.body.replace(
                                /src="\/resources\/images/g,
                                'src="https://localhost:7184/resources/images'
                            )
                        }}
                    />
                ))}
            </div>

            <div
                className="modal fade"
                id="editorModal"
                tabIndex="-1"
                ref={modalRef}
                aria-labelledby="editorModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editorModalLabel">Edit Footer Content</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={handleClose}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div id="summernote"></div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={handleSave}>
                                Save Changes
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="modal fade"
                id="previewFooterModal"
                tabIndex="-1"
                ref={previewModalRef}
                aria-labelledby="previewFooterModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-xl" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="previewFooterModalLabel">Footer Preview</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body text-center">
                            <div className="mb-3 d-flex justify-content-center gap-4">
                                <button
                                    className={`btn ${previewFilter === 'Public' ? 'btn-primary' : 'btn-link'}`}
                                    onClick={() => setPreviewFilter('Public')}
                                >
                                    Public Items Only
                                </button>
                                <button
                                    className={`btn ${previewFilter === 'Preview' ? 'btn-primary' : 'btn-link'}`}
                                    onClick={() => setPreviewFilter('Preview')}
                                >
                                    Preview Items Only
                                </button>
                                <button
                                    className={`btn ${previewFilter === 'Both' ? 'btn-primary' : 'btn-link'}`}
                                    onClick={() => setPreviewFilter('Both')}
                                >
                                    Both
                                </button>
                            </div>

                            <div className="footer-preview-wrapper w-100">
                                <div className="footer-preview-layout d-flex justify-content-between">
                                    {filteredFooterData.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className={`footer-column flex-fill px-3 text-start`}
                                            dangerouslySetInnerHTML={{
                                                __html: item.body.replace(
                                                    /src="\/resources\/images/g,
                                                    'src="https://localhost:7184/resources/images'
                                                )
                                            }}
                                        />
                                    ))}
                                </div>

                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="footer">© 2025 Website by Belsito Communications Inc.</footer>
        </div>
    );
};

export default FooterEditor;

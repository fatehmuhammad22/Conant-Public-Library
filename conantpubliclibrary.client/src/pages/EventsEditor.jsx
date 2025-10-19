import React, { useEffect, useState, useRef } from 'react';
import './EventsEditor.css';
import $ from 'jquery';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
window.bootstrap = bootstrap;

import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'summernote/dist/summernote-lite.js';
import 'summernote/dist/summernote-lite.css';

const EventsEditor = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [locations, setLocations] = useState([]);
    const [types, setTypes] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '', date: '', startTime: '', endTime: '', eventLocationId: '', eventTypeId: '', description: ''
    });

    const modalRef = useRef(null);
    const modalInstanceRef = useRef(null);

    useEffect(() => {
        fetchEvents(); fetchLocations(); fetchTypes();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch('https://localhost:7184/api/events');
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await fetch('https://localhost:7184/api/eventlocations');
            const data = await response.json();
            setLocations(data);
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const fetchTypes = async () => {
        try {
            const response = await fetch('https://localhost:7184/api/eventtypes');
            const data = await response.json();
            setTypes(data);
        } catch (error) {
            console.error("Error fetching types:", error);
        }
    };

    const generateUUID = () => {
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
    };

    const getSummernoteConfig = () => {
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

        return {
            placeholder: 'Event description...',
            tabsize: 2,
            height: 300,
            focus: true,
            toolbar: [
                ['style', ['style']], ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
                ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color', 'backcolor']],
                ['para', ['ul', 'ol', 'paragraph']], ['insert', ['link', 'picture', 'video', 'table', 'hr']],
                ['view', ['fullscreen', 'codeview', 'help']], ['align', ['left', 'center', 'right', 'justify']],
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
                            $('#summernote-event').summernote('insertImage', imageUrl, function ($image) {
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
        };
    };

    const openAddModal = () => {
        setEditingEvent(null);
        setNewEvent({ title: '', date: '', startTime: '', endTime: '', eventLocationId: '', eventTypeId: '', description: '' });

        setTimeout(() => {
            if ($('#summernote-event').next().hasClass('note-editor')) {
                $('#summernote-event').summernote('destroy');
            }
            $('#summernote-event').summernote(getSummernoteConfig());

            $('#summernote-event').summernote('code', '');

            if (!modalInstanceRef.current) modalInstanceRef.current = new bootstrap.Modal(modalRef.current);
            modalInstanceRef.current.show();
        }, 100);
    };

    const formatDisplayTime = (timeStr) => {
        if (!timeStr) return '';

        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
            return timeStr.trim();
        }

        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        return `${hours}:${minutes} ${ampm}`;
    };



    const formatTime = (timeStr) => {
        if (!timeStr) return '';

        const date = new Date(`1970-01-01T${timeStr}`);
        if (isNaN(date)) {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        return date.toTimeString().slice(0, 5);
    };



    const openEditModal = (event) => {
        setEditingEvent(event);
        setNewEvent({
            title: event.title,
            date: event.date.split('T')[0],
            startTime: formatTime(event.startTime),
            endTime: formatTime(event.endTime),
            eventLocationId: event.eventLocationId,
            eventTypeId: event.eventTypeId,
            description: event.description
        });

        setTimeout(() => {
            if ($('#summernote-event').next().hasClass('note-editor')) {
                $('#summernote-event').summernote('destroy');
            }
            $('#summernote-event').summernote(getSummernoteConfig());
            $('#summernote-event').summernote('code', event.description);
            if (!modalInstanceRef.current) modalInstanceRef.current = new bootstrap.Modal(modalRef.current);
            modalInstanceRef.current.show();
        }, 100);
    };

    const handleSaveEvent = async () => {
        const updatedDescription = $('#summernote-event').summernote('code');
        const fullDate = newEvent.date ? newEvent.date + "T00:00:00" : '';
        const eventData = {
            id: editingEvent?.id,
            title: newEvent.title,
            date: fullDate,
            startTime: newEvent.startTime,
            endTime: newEvent.endTime,
            description: updatedDescription,
            eventTypeId: parseInt(newEvent.eventTypeId, 10),
            eventLocationId: parseInt(newEvent.eventLocationId, 10)
        };

        const url = editingEvent ? `https://localhost:7184/api/events/${editingEvent.id}` : 'https://localhost:7184/api/events';
        const method = editingEvent ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                alert(editingEvent ? "Event updated successfully!" : "Event added successfully!");
                handleCloseModal();
                fetchEvents();
            } else {
                const errorText = await response.text();
                alert("Operation failed: " + errorText);
            }
        } catch (error) {
            alert("An error occurred.");
        }
    };

    const handleDeleteEvent = async () => {
        if (!editingEvent) return;
        if (!window.confirm("Are you sure you want to delete this event?")) return;

        try {
            const response = await fetch(`https://localhost:7184/api/events/${editingEvent.id}`, { method: 'DELETE' });
            if (response.ok) {
                alert("Event deleted.");
                handleCloseModal();
                fetchEvents();
            } else {
                const errorText = await response.text();
                alert("Delete failed: " + errorText);
            }
        } catch (error) {
            alert("An error occurred.");
        }
    };

    const handleCloseModal = () => {
        $('#summernote-event').summernote('destroy');
        if (modalInstanceRef.current) modalInstanceRef.current.hide();
    };

    return (
        <div className="events-container">
            <h2 className="events-header">Conant Public Library Content Management</h2>
            <div className="events-nav">
                <a href="/dashboard" onClick={() => navigate('/dashboard')}>Back to Dashboard</a> | <a href="#">Link Builder</a> | <a href="#">Change Password</a> | <a href="#">Logout</a>
            </div>

            <table className="table table-bordered mt-4">
                <thead>
                    <tr>
                        <th>Title</th><th>Date / Time</th><th>Location</th><th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {events.length === 0 ? (
                        <tr><td colSpan="4" className="text-center">No matching record found</td></tr>
                    ) : (
                        events.map(ev => (
                            <tr key={ev.id} onClick={() => openEditModal(ev)} style={{ cursor: 'pointer' }}>
                                <td>{ev.title}</td>
                                <td>
                                    {ev.date.split('T')[0]} {formatDisplayTime(ev.startTime)} - {formatDisplayTime(ev.endTime)}
                                </td>
                                <td>{ev.eventLocation?.name || 'N/A'}</td>
                                <td>{ev.eventType?.name || 'N/A'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <button className="btn btn-primary mt-3" onClick={openAddModal}>Add New Event</button>

            <div className="modal fade" id="addEventModal" tabIndex="-1" ref={modalRef} aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{editingEvent ? 'Edit Event' : 'Add Event'}</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                        </div>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12">
                                    <label>Title</label>
                                    <input type="text" className="form-control" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                                </div>
                                <div className="col-md-6">
                                    <label>Date</label>
                                    <input type="date" className="form-control" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                                </div>
                                <div className="col-md-6 d-flex gap-2">
                                    <div className="flex-fill">
                                        <label>Start Time</label>
                                        <input type="time" className="form-control" value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} />
                                    </div>
                                    <div className="flex-fill">
                                        <label>End Time (optional)</label>
                                        <input type="time" className="form-control" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label>Event Location</label>
                                    <select className="form-select" value={newEvent.eventLocationId} onChange={(e) => setNewEvent({ ...newEvent, eventLocationId: e.target.value })}>
                                        <option value="">-- Select --</option>
                                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label>Event Type</label>
                                    <select className="form-select" value={newEvent.eventTypeId} onChange={(e) => setNewEvent({ ...newEvent, eventTypeId: e.target.value })}>
                                        <option value="">-- Select --</option>
                                        {types.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label>Description</label>
                                    <div id="summernote-event"></div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {editingEvent ? (
                                <>
                                    <button className="btn btn-success" onClick={handleSaveEvent}>Save Changes</button>
                                    <button className="btn btn-danger" onClick={handleDeleteEvent}>Delete Event</button>
                                </>
                            ) : (
                                <button className="btn btn-primary" onClick={handleSaveEvent}>Add Event</button>
                            )}
                            <button className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="footer mt-4">© 2025 Website by Belsito Communications Inc.</footer>
        </div>
    );
};

export default EventsEditor;
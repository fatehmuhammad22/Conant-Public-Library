import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./CalendarEditor.css";

const CalendarEditor = ({ subcategoryId: propSubcategoryId }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        subcategoryId = propSubcategoryId,
        subcategoryName = "Untitled",
    } = location.state || {};

    const [title, setTitle] = useState("");
    const [eventTypeId, setEventTypeId] = useState("");
    const [eventLocationId, setEventLocationId] = useState("");
    const [eventTypes, setEventTypes] = useState([]);
    const [eventLocations, setEventLocations] = useState([]);
    const [existingEventId, setExistingEventId] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [events, setEvents] = useState([]);
    const [viewMode, setViewMode] = useState("calendar");
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        if (!subcategoryId) return;

        const fetchAllEvents = async () => {
            try {
                const res = await fetch(
                    `https://localhost:7184/api/Events/GetBySubcategory/${subcategoryId}`
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setEvents(data);
            } catch (err) {
                console.error("Error fetching events:", err);
                setEvents([]);
            }
        };

        fetchAllEvents();
    }, [subcategoryId]);

    useEffect(() => {
        if (!subcategoryId) return;

        const fetchEventTypes = async () => {
            try {
                const res = await fetch("https://localhost:7184/api/eventtypes");
                const data = await res.json();
                setEventTypes(data);
            } catch {
                setEventTypes([]);
            }
        };

        const fetchEventLocations = async () => {
            try {
                const res = await fetch("https://localhost:7184/api/eventlocations");
                const data = await res.json();
                setEventLocations(data);
            } catch {
                setEventLocations([]);
            }
        };

        const fetchExistingEvent = async () => {
            try {
                const res = await fetch(
                    `https://localhost:7184/api/Events/GetFirstBySubcategory/${subcategoryId}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setExistingEventId(data.id);
                    setTitle(data.title || "");
                    setEventTypeId(data.eventTypeId?.toString() || "");
                    setEventLocationId(data.eventLocationId?.toString() || "");
                } else {
                    setExistingEventId(null);
                    setTitle("");
                    setEventTypeId("");
                    setEventLocationId("");
                }
            } catch {
                console.log("No existing event or fetch failed");
            }
        };

        fetchEventTypes();
        fetchEventLocations();
        fetchExistingEvent();
    }, [subcategoryId]);

    const handleSave = () => {
        if (!subcategoryId) {
            alert("Subcategory ID is missing!");
            return;
        }

        const calendarData = {
            id: existingEventId,
            subcategoryId,
            title,
            eventTypeId: parseInt(eventTypeId),
            eventLocationId: parseInt(eventLocationId),
        };

        const url = existingEventId
            ? `https://localhost:7184/api/Events/${existingEventId}`
            : `https://localhost:7184/api/Events`;
        const method = existingEventId ? "PUT" : "POST";

        fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(calendarData),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to save");
                return res.json();
            })
            .then(() => {
                alert("Saved successfully!");
                if (subcategoryId) {
                    fetch(
                        `https://localhost:7184/api/Events/GetBySubcategory/${subcategoryId}`
                    )
                        .then((r) => r.json())
                        .then(setEvents)
                        .catch(() => setEvents([]));

                    fetch(
                        `https://localhost:7184/api/Events/GetFirstBySubcategory/${subcategoryId}`
                    )
                        .then((r) => {
                            if (r.ok) return r.json();
                            throw new Error("No event");
                        })
                        .then((data) => {
                            setExistingEventId(data.id);
                            setTitle(data.title || "");
                            setEventTypeId(data.eventTypeId?.toString() || "");
                            setEventLocationId(data.eventLocationId?.toString() || "");
                        })
                        .catch(() => {
                            setExistingEventId(null);
                            setTitle("");
                            setEventTypeId("");
                            setEventLocationId("");
                        });
                }
            })
            .catch((err) => alert("Save failed: " + err.message));
    };

    const openEventDetails = (event) => {
        let imageUrl = null;
        if (event.description) {
            const match = event.description.match(/<img[^>]+src="([^">]+)"/i);
            if (match) {
                imageUrl = match[1];
            }
        }

        setSelectedEvent({
            ...event,
            imageUrl: imageUrl || event.imageUrl || "/placeholder.jpg"
        });
    };

    const closeEventDetails = () => {
        setSelectedEvent(null);
    };

    return (
        <div className="container mt-3">
            <h2 className="text-center mb-3">Conant Public Library Content Management</h2>

            <div className="events-nav mb-4 text-center">
                <a href="/dashboard" onClick={() => navigate("/dashboard")}>Back to Dashboard</a> |{" "}
                <a href="#">Link Builder</a> | <a href="#">Change Password</a> |{" "}
                <a href="#">Logout</a>
            </div>

            <div className="mb-3">
                <h4 className="text-center fw-bold">Calendar for Page '{subcategoryName}'</h4>
                <div className="text-start mt-2">
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowPreview(true)}
                    >
                        Preview
                    </button>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold">Title</label>
                <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <label className="form-label fw-bold">Event Type</label>
                    <select
                        className="form-select"
                        value={eventTypeId}
                        onChange={(e) => setEventTypeId(e.target.value)}
                    >
                        <option value="">-- Select Event Type --</option>
                        {eventTypes.map((et) => (
                            <option key={et.id} value={et.id}>{et.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-bold">Event Location</label>
                    <select
                        className="form-select"
                        value={eventLocationId}
                        onChange={(e) => setEventLocationId(e.target.value)}
                    >
                        <option value="">-- Select Event Location --</option>
                        {eventLocations.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="text-end">
                <button className="btn btn-primary me-3" onClick={handleSave}>
                    Save Changes
                </button>
                <button className="btn btn-link" onClick={() => navigate("/")}>
                    Cancel
                </button>
            </div>

            <footer className="text-center mt-5">
                <hr />
                <p>© 2025 Website by Belsito Communications Inc.</p>
            </footer>

            {showPreview && (
                <div className="modal show fade d-block" tabIndex="-1">
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Event Preview</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowPreview(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex justify-content-end mb-3">
                                    <button
                                        className={`btn btn-sm me-2 ${viewMode === "calendar" ? "btn-primary" : "btn-outline-primary"}`}
                                        onClick={() => setViewMode("calendar")}
                                    >
                                        Calendar View
                                    </button>
                                    <button
                                        className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-outline-primary"}`}
                                        onClick={() => setViewMode("list")}
                                    >
                                        List View
                                    </button>
                                </div>

                                {viewMode === "calendar" ? (
                                    <FullCalendar
                                        plugins={[dayGridPlugin, interactionPlugin]}
                                        initialView="dayGridMonth"
                                        height="auto"
                                        events={events.map((ev) => ({
                                            id: ev.id,
                                            title: ev.title,
                                            start: ev.date,
                                            extendedProps: {
                                                description: ev.description,
                                                starttime: ev.startTime,
                                                endtime: ev.endTime,
                                                imageUrl: ev.imageUrl,
                                                location: ev.location,
                                                type: ev.type
                                            },
                                        }))}
                                        eventClick={(info) => {
                                            const { title, extendedProps } = info.event;
                                            openEventDetails({
                                                title,
                                                description: extendedProps.description,
                                                startTime: extendedProps.starttime,
                                                endTime: extendedProps.endtime,
                                                date: info.event.startStr,
                                                imageUrl: extendedProps.imageUrl,
                                                location: extendedProps.location,
                                                type: extendedProps.type
                                            });
                                        }}
                                    />
                                ) : (
                                    <ul className="list-group">
                                        {events.length > 0 ? (
                                            events.map((ev) => (
                                                <li
                                                    key={ev.id}
                                                    className="list-group-item list-group-item-action"
                                                    role="button"
                                                    onClick={() =>
                                                        openEventDetails({
                                                            title: ev.title,
                                                            description: ev.description,
                                                            startTime: ev.startTime,
                                                            endTime: ev.endTime,
                                                            date: ev.date,
                                                            imageUrl: ev.imageUrl,
                                                            location: ev.location,
                                                            type: ev.type
                                                        })
                                                    }
                                                >
                                                    <strong>{ev.title}</strong> — {ev.date?.split("T")[0]}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="list-group-item">No events found.</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowPreview(false)}
                                >
                                    Close Preview
                                </button>
                            </div>
                        </div>
                    </div>

                    {selectedEvent && (
                        <div className="modal show fade d-block" tabIndex="-1">
                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Event Information</h5>
                                        <button type="button" className="btn-close" onClick={closeEventDetails}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Title</label>
                                            <div>{selectedEvent.title}</div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Date and Time</label>
                                            <div>
                                                {selectedEvent.date?.split("T")[0]}{" "}
                                                {selectedEvent.startTime
                                                    ? `${selectedEvent.startTime} - ${selectedEvent.endTime || ""}`
                                                    : ""}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Location</label>
                                            <div>{selectedEvent.location || "Main Library"}</div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Type</label>
                                            <div>{selectedEvent.type || "Adults & Teens"}</div>
                                        </div>
                                        <div className="mb-3 text-center">
                                            <img
                                                src={selectedEvent.imageUrl}
                                                alt={selectedEvent.title}
                                                className="img-fluid rounded"
                                                style={{ maxHeight: "500px", objectFit: "contain" }}
                                            />
                                        </div>
                                        <div
                                            className="mt-3 small text-muted"
                                            dangerouslySetInnerHTML={{ __html: selectedEvent.description || "No description provided." }}
                                        ></div>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-link" onClick={closeEventDetails}>
                                            Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalendarEditor;

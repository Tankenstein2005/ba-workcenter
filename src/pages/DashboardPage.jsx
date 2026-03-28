import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAsync } from "../hooks/useAsync.js";
import EventTypeForm from "../components/EventTypeForm.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function DashboardPage() {
  const loadEventTypes = useCallback(() => api.listEventTypes(), []);
  const { data, loading, error, execute } = useAsync(
    loadEventTypes,
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [notice, setNotice] = useState("");
  const requestedEditId = searchParams.get("edit");
  const handledEditRef = useRef("");

  const clearEditSearchParam = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("edit");
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const openEditor = useCallback(async (id) => {
    setNotice("");
    if (!id) {
      setEditing({});
      return;
    }
    try {
      const detail = await api.getEventType(id);
      setEditing(detail);
    } catch (err) {
      setNotice(err.message);
    }
  }, []);

  async function handleSave(payload) {
    try {
      setSaving(true);
      if (editing?.id) {
        await api.updateEventType(editing.id, payload);
      } else {
        await api.createEventType(payload);
      }
      setEditing(null);
      clearEditSearchParam();
      setNotice(editing?.id ? "Event updated." : "Event created.");
      await execute();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      setDeleting(true);
      await api.deleteEventType(pendingDelete.id);
      setPendingDelete(null);
      setNotice(`Deleted ${pendingDelete.title}.`);
      await execute();
    } catch (err) {
      setNotice(err.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleCopyLink(eventType) {
    try {
      await navigator.clipboard.writeText(eventType.publicLink);
      setCopiedId(eventType.id);
      setNotice(`Copied link for ${eventType.title}.`);
      window.setTimeout(
        () =>
          setCopiedId((current) =>
            current === eventType.id ? null : current,
          ),
        1800,
      );
    } catch {
      setNotice("Could not copy the public link from this browser.");
    }
  }

  useEffect(() => {
    if (!requestedEditId || !data?.length || editing) return;
    if (handledEditRef.current === requestedEditId) return;

    const matchingEvent = data.find(
      (eventType) => String(eventType.id) === requestedEditId,
    );
    if (!matchingEvent) return;

    handledEditRef.current = requestedEditId;
    openEditor(requestedEditId);
  }, [data, editing, openEditor, requestedEditId]);

  useEffect(() => {
    if (requestedEditId) return;
    handledEditRef.current = "";
  }, [requestedEditId]);

  return (
    <section>
      <div className="page-header">
        <div>
          <span className="eyebrow">Event types</span>
          <h2>Configure bookable experiences</h2>
          <p>
            Each event gets a public link, availability windows, and custom
            intake questions.
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => openEditor(null)}
        >
          New event
        </button>
      </div>

      {notice && <p className="status-note">{notice}</p>}
      {loading && <p className="empty-state">Loading event types...</p>}
      {error && <p className="empty-state error">{error}</p>}
      <div className="cards-stack">
        {data?.map((eventType) => (
          <article className="event-card" key={eventType.id}>
            <div>
              <div className="event-card-title">
                <span className="dot" style={{ background: eventType.color }} />
                <h3>{eventType.title}</h3>
                {eventType.is_hidden ? (
                  <span className="pill subtle-pill">Hidden</span>
                ) : (
                  <span className="pill subtle-pill">Live</span>
                )}
              </div>
              <p>{eventType.description || "No description yet."}</p>
              <div className="meta-row">
                <span>{eventType.duration_minutes} min</span>
                <span>{eventType.timezone}</span>
                <span>{eventType.bookings_count} active bookings</span>
              </div>
              <div className="card-link-row">
                <a href={eventType.publicLink} target="_blank" rel="noreferrer">
                  {eventType.publicLink}
                </a>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => handleCopyLink(eventType)}
                >
                  {copiedId === eventType.id ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
            <div className="card-actions action-stack">
              <a
                className="ghost-button"
                href={eventType.publicLink}
                target="_blank"
                rel="noreferrer"
              >
                Preview
              </a>
              <Link
                className="ghost-button"
                to={`/availability?event=${eventType.id}`}
              >
                Availability
              </Link>
              <button
                type="button"
                className="ghost-button"
                onClick={() => openEditor(eventType.id)}
              >
                Edit
              </button>
              <button
                type="button"
                className="ghost-button danger"
                onClick={() => setPendingDelete(eventType)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {!loading && !data?.length && (
        <div className="empty-panel">
          <h3>No event types yet</h3>
          <p>Create your first event and start sharing booking links.</p>
        </div>
      )}

      {editing && (
        <EventTypeForm
          initialValue={editing.id ? editing : null}
          onSubmit={handleSave}
          onClose={() => {
            setEditing(null);
            clearEditSearchParam();
          }}
          saving={saving}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete event type"
          description={`Delete "${pendingDelete.title}" and remove its booking configuration?`}
          confirmLabel="Delete event"
          confirmTone="danger"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </section>
  );
}

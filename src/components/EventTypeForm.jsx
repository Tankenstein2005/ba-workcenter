import { useEffect, useState } from "react";
import { weekdayOptions } from "../utils/dates.js";

const defaultAvailability = [
  {
    weekday: 1,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    scheduleName: "Weekdays",
  },
  {
    weekday: 2,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    scheduleName: "Weekdays",
  },
  {
    weekday: 3,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    scheduleName: "Weekdays",
  },
  {
    weekday: 4,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    scheduleName: "Weekdays",
  },
  {
    weekday: 5,
    startTime: "09:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    scheduleName: "Weekdays",
  },
];

const blankForm = {
  title: "",
  description: "",
  durationMinutes: 30,
  slug: "",
  isHidden: false,
  timezone: "Asia/Kolkata",
  color: "#f97316",
  locationLabel: "Google Meet",
  bufferBefore: 0,
  bufferAfter: 0,
  availability: defaultAvailability,
  overrides: [],
  questions: [
    { label: "What should we focus on?", fieldType: "text", isRequired: false },
  ],
};

export default function EventTypeForm({
  initialValue,
  onSubmit,
  onClose,
  saving,
}) {
  const [form, setForm] = useState(blankForm);

  function handleColorChange(value) {
    updateField("color", value.toLowerCase());
  }

  function handleColorHexChange(value) {
    const normalized = value.startsWith("#") ? value : `#${value}`;
    updateField("color", normalized.slice(0, 7));
  }

  useEffect(() => {
    if (!initialValue) {
      setForm(blankForm);
      return;
    }

    setForm({
      title: initialValue.title || "",
      description: initialValue.description || "",
      durationMinutes: initialValue.duration_minutes || 30,
      slug: initialValue.slug || "",
      isHidden: Boolean(initialValue.is_hidden),
      timezone: initialValue.timezone || "Asia/Kolkata",
      color: initialValue.color || "#f97316",
      locationLabel: initialValue.location_label || "Google Meet",
      bufferBefore: initialValue.buffer_before || 0,
      bufferAfter: initialValue.buffer_after || 0,
      availability:
        initialValue.availability?.map((item) => ({
          weekday: item.weekday,
          startTime: item.start_time.slice(0, 5),
          endTime: item.end_time.slice(0, 5),
          timezone: item.timezone,
          scheduleName: item.schedule_name,
        })) || defaultAvailability,
      overrides:
        initialValue.overrides?.map((item) => ({
          overrideDate: item.override_date,
          isBlocked: Boolean(item.is_blocked),
          startTime: item.start_time?.slice(0, 5) || "",
          endTime: item.end_time?.slice(0, 5) || "",
          timezone: item.timezone,
          note: item.note || "",
        })) || [],
      questions:
        initialValue.questions?.map((item) => ({
          label: item.label,
          fieldType: item.field_type,
          isRequired: Boolean(item.is_required),
        })) || [],
    });
  }, [initialValue]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateListItem(key, index, field, value) {
    setForm((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function addAvailabilityRule() {
    updateField("availability", [
      ...form.availability,
      {
        weekday: 1,
        startTime: "09:00",
        endTime: "17:00",
        timezone: form.timezone,
        scheduleName: "Extra schedule",
      },
    ]);
  }

  function addOverride() {
    updateField("overrides", [
      ...form.overrides,
      {
        overrideDate: "",
        isBlocked: true,
        startTime: "",
        endTime: "",
        timezone: form.timezone,
        note: "",
      },
    ]);
  }

  function addQuestion() {
    updateField("questions", [
      ...form.questions,
      { label: "", fieldType: "text", isRequired: false },
    ]);
  }

  function removeListItem(key, index) {
    updateField(
      key,
      form[key].filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      ...form,
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="modal-panel" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <h2>{initialValue ? "Edit event type" : "Create event type"}</h2>
            <p>
              Shape the experience, availability, and questions in one place.
            </p>
            {initialValue?.publicLink ? (
              <div className="card-link-row inline-link-row">
                <a
                  href={initialValue.publicLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  {initialValue.publicLink}
                </a>
              </div>
            ) : null}
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="form-grid">
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </label>
          <label>
            Public slug
            <input
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="thirty-minute-intro"
              required
            />
            <span className="helper-text">
              Spaces are converted into dashes when you save.
            </span>
          </label>
          <label className="full-width">
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </label>
          <label>
            Duration (minutes)
            <input
              type="number"
              min="15"
              step="15"
              value={form.durationMinutes}
              onChange={(e) =>
                updateField("durationMinutes", Number(e.target.value))
              }
            />
          </label>
          <label>
            Timezone
            <input
              value={form.timezone}
              onChange={(e) => updateField("timezone", e.target.value)}
            />
          </label>
          <label>
            Location label
            <input
              value={form.locationLabel}
              onChange={(e) => updateField("locationLabel", e.target.value)}
            />
          </label>
          <label className="full-width">
            Accent color
            <div className="color-picker-row">
              <label
                className="color-swatch-field"
                style={{ "--accent-preview": form.color }}
              >
                <span className="color-swatch-preview" aria-hidden="true" />
                <span className="color-swatch-copy">
                  <strong>Pick accent</strong>
                  <span>{form.color}</span>
                </span>
                <input
                  className="color-picker-input"
                  type="color"
                  value={form.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  aria-label="Pick accent color"
                />
              </label>
              <input
                className="color-hex-input"
                value={form.color}
                maxLength="7"
                onChange={(e) => handleColorHexChange(e.target.value)}
                placeholder="#f97316"
                aria-label="Accent color hex value"
              />
            </div>
            <span className="helper-text">
              The accent is used for the event dot and event identity.
            </span>
          </label>
          <label>
            Buffer before
            <input
              type="number"
              min="0"
              value={form.bufferBefore}
              onChange={(e) =>
                updateField("bufferBefore", Number(e.target.value))
              }
            />
          </label>
          <label>
            Buffer after
            <input
              type="number"
              min="0"
              value={form.bufferAfter}
              onChange={(e) =>
                updateField("bufferAfter", Number(e.target.value))
              }
            />
          </label>
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={form.isHidden}
            onChange={(e) => updateField("isHidden", e.target.checked)}
          />
          Hide this event from the public list
        </label>
        <p className="helper-text">
          Keep this on if the event should only be reachable by direct link.
        </p>

        <section className="section-card">
          <div className="section-card-header">
            <div>
              <h3>Availability rules</h3>
              <p>Support multiple schedules with weekday ranges.</p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={addAvailabilityRule}
            >
              Add rule
            </button>
          </div>
          {form.availability.map((item, index) => (
            <div className="inline-form" key={`${item.weekday}-${index}`}>
              <input
                value={item.scheduleName}
                onChange={(e) =>
                  updateListItem(
                    "availability",
                    index,
                    "scheduleName",
                    e.target.value,
                  )
                }
                placeholder="Schedule name"
              />
              <select
                value={item.weekday}
                onChange={(e) =>
                  updateListItem(
                    "availability",
                    index,
                    "weekday",
                    Number(e.target.value),
                  )
                }
              >
                {weekdayOptions.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={item.startTime}
                onChange={(e) =>
                  updateListItem(
                    "availability",
                    index,
                    "startTime",
                    e.target.value,
                  )
                }
              />
              <input
                type="time"
                value={item.endTime}
                onChange={(e) =>
                  updateListItem(
                    "availability",
                    index,
                    "endTime",
                    e.target.value,
                  )
                }
              />
              <button
                type="button"
                className="ghost-button danger"
                onClick={() => removeListItem("availability", index)}
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <section className="section-card">
          <div className="section-card-header">
            <div>
              <h3>Date overrides</h3>
              <p>Block holidays or define special hours for specific dates.</p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={addOverride}
            >
              Add override
            </button>
          </div>
          {form.overrides.map((item, index) => (
            <div className="inline-form" key={`override-${index}`}>
              <input
                type="date"
                value={item.overrideDate}
                onChange={(e) =>
                  updateListItem(
                    "overrides",
                    index,
                    "overrideDate",
                    e.target.value,
                  )
                }
              />
              <select
                value={item.isBlocked ? "blocked" : "custom"}
                onChange={(e) =>
                  updateListItem(
                    "overrides",
                    index,
                    "isBlocked",
                    e.target.value === "blocked",
                  )
                }
              >
                <option value="blocked">Blocked</option>
                <option value="custom">Custom hours</option>
              </select>
              {!item.isBlocked && (
                <>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) =>
                      updateListItem(
                        "overrides",
                        index,
                        "startTime",
                        e.target.value,
                      )
                    }
                  />
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) =>
                      updateListItem(
                        "overrides",
                        index,
                        "endTime",
                        e.target.value,
                      )
                    }
                  />
                </>
              )}
              <input
                value={item.note}
                onChange={(e) =>
                  updateListItem("overrides", index, "note", e.target.value)
                }
                placeholder="Internal note"
              />
              <button
                type="button"
                className="ghost-button danger"
                onClick={() => removeListItem("overrides", index)}
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <section className="section-card">
          <div className="section-card-header">
            <div>
              <h3>Custom questions</h3>
              <p>Collect a bit more context before the meeting starts.</p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={addQuestion}
            >
              Add question
            </button>
          </div>
          {form.questions.map((item, index) => (
            <div className="inline-form" key={`question-${index}`}>
              <input
                value={item.label}
                onChange={(e) =>
                  updateListItem("questions", index, "label", e.target.value)
                }
                placeholder="Question label"
              />
              <select
                value={item.fieldType}
                onChange={(e) =>
                  updateListItem(
                    "questions",
                    index,
                    "fieldType",
                    e.target.value,
                  )
                }
              >
                <option value="text">Text</option>
                <option value="textarea">Long text</option>
              </select>
              <label className="compact-toggle">
                <input
                  type="checkbox"
                  checked={item.isRequired}
                  onChange={(e) =>
                    updateListItem(
                      "questions",
                      index,
                      "isRequired",
                      e.target.checked,
                    )
                  }
                />
                Required
              </label>
              <button
                type="button"
                className="ghost-button danger"
                onClick={() => removeListItem("questions", index)}
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={saving}>
            {saving
              ? "Saving..."
              : initialValue
                ? "Save changes"
                : "Create event"}
          </button>
        </div>
      </form>
    </div>
  );
}

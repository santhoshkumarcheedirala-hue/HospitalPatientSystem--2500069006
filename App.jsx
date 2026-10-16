
import React from "react";
import "./App.css";

const initialPatients = [
  {
    id: "P101",
    name: "Rahul Kumar",
    doctor: "Dr. Suresh",
    appointment: "2026-10-14T10:00",
  },
  {
    id: "P102",
    name: "Priya Sharma",
    doctor: "Dr. Anitha",
    appointment: "2026-10-14T11:30",
  },
  {
    id: "P103",
    name: "Arjun Reddy",
    doctor: "Dr. Kiran",
    appointment: "2026-10-15T09:00",
  },
  {
    id: "P104",
    name: "Sneha Rao",
    doctor: "Dr. Lakshmi",
    appointment: "2026-10-15T14:00",
  },
];

function App() {
  const [patients, setPatients] = React.useState(() => {
    try {
      const saved = localStorage.getItem("hospitalPatients");
      return saved ? JSON.parse(saved) : initialPatients;
    } catch {
      return initialPatients;
    }
  });

  const [search, setSearch] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [editingId, setEditingId] = React.useState(null);

  const [form, setForm] = React.useState({
    id: "",
    name: "",
    doctor: "",
    appointment: "",
  });

  React.useEffect(() => {
    localStorage.setItem("hospitalPatients", JSON.stringify(patients));
  }, [patients]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm({ id: "", name: "", doctor: "", appointment: "" });
    setEditingId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const patient = {
      id: form.id.trim().toUpperCase(),
      name: form.name.trim(),
      doctor: form.doctor.trim(),
      appointment: form.appointment,
    };

    if (!patient.id || !patient.name || !patient.doctor || !patient.appointment) {
      setMessage("Please complete all patient details.");
      return;
    }

    if (Number.isNaN(new Date(patient.appointment).getTime())) {
      setMessage("Please select a valid appointment date and time.");
      return;
    }

    if (
      patients.some(
        (p) => p.id === patient.id && p.id !== editingId
      )
    ) {
      setMessage("This Patient ID already exists.");
      return;
    }

    if (editingId) {
      setPatients((previous) =>
        previous.map((p) => (p.id === editingId ? patient : p))
      );
      setMessage("Patient updated successfully!");
    } else {
      setPatients((previous) => [...previous, patient]);
      setMessage("Patient added successfully!");
    }

    resetForm();
  }

  function editPatient(patient) {
    setForm({ ...patient });
    setEditingId(patient.id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deletePatient(id) {
    if (!window.confirm(`Delete patient ${id}?`)) return;

    setPatients((previous) => previous.filter((p) => p.id !== id));

    if (editingId === id) resetForm();

    setMessage("Patient deleted successfully!");
  }

  function exportPatients() {
    const headers = [
      "Patient ID",
      "Patient Name",
      "Doctor Assigned",
      "Appointment Timing",
    ];

    const rows = patients.map((p) => [
      p.id,
      p.name,
      p.doctor,
      p.appointment,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "hospital-patient-records.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const filteredPatients = patients.filter((p) => {
    const query = search.trim().toLowerCase();

    return (
      p.id.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query)
    );
  });

  function formatAppointment(value) {
    const date = new Date(value);

    if (!value || Number.isNaN(date.getTime())) {
      return "Not scheduled";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const doctorCount = new Set(
    patients.map((p) => p.doctor.trim().toLowerCase())
  ).size;

  return (
    <div className="app">
      <header className="header">
        <div className="logo">✚</div>
        <div>
          <h1>CarePoint Hospital</h1>
          <p>Patient Information System</p>
        </div>
      </header>

      <main className="container">
        <h2>Patient Dashboard</h2>
        <p className="subtitle">
          Manage patient details and scheduled appointments.
        </p>

        <div className="stats">
          <div className="stat-card">
            <span>Total Patients</span>
            <h2>{patients.length}</h2>
          </div>

          <div className="stat-card">
            <span>Assigned Doctors</span>
            <h2>{doctorCount}</h2>
          </div>

          <div className="stat-card">
            <span>Scheduled Appointments</span>
            <h2>{patients.filter((p) => p.appointment).length}</h2>
          </div>
        </div>

        <section className="table-card">
          <h3>{editingId ? "Edit Patient" : "Add New Patient"}</h3>

          <form onSubmit={handleSubmit} className="patient-form">
            <input
              name="id"
              placeholder="Patient ID (e.g. P105)"
              value={form.id}
              onChange={handleChange}
              required
            />

            <input
              name="name"
              placeholder="Patient Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="doctor"
              placeholder="Doctor Assigned"
              value={form.doctor}
              onChange={handleChange}
              required
            />

            <input
              type="datetime-local"
              name="appointment"
              value={form.appointment}
              onChange={handleChange}
              required
            />

            <button type="submit">
              {editingId ? "Save Changes" : "+ Add Patient"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </form>

          {message && <p role="status">{message}</p>}
        </section>

        <section className="table-card">
          <h3>Patient Records</h3>

          <button
            type="button"
            className="export-btn"
            onClick={exportPatients}
          >
            Download Patient Report
          </button>

          <input
            className="search-box"
            placeholder="Search by Patient ID or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Doctor Assigned</th>
                  <th>Appointment Timing</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.id}</td>
                      <td>{patient.name}</td>
                      <td>{patient.doctor}</td>
                      <td>{formatAppointment(patient.appointment)}</td>
                      <td>
                        <span className="status">Scheduled</span>
                      </td>
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => editPatient(patient)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => deletePatient(patient.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No patients found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer>
          © 2026 CarePoint Hospital | Patient Information System
        </footer>
      </main>
    </div>
  );
}

export default App;

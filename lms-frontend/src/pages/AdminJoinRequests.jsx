
import { useEffect, useState } from "react";

function AdminJoinRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/admin/join-requests/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Unable to load invitation requests.");
      }

      setRequests(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="admin-join-requests">
      <h1>Invitation Requests</h1>
      <p>Review requests from people who want to join SkillNest.</p>

      {loading && <p>Loading requests...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <p>No invitation requests found.</p>
      )}

      {requests.map((request) => (
        <div key={request.id} className="request-card">
          <h3>{request.name}</h3>
          <p><strong>Email:</strong> {request.email}</p>
          <p><strong>Requested role:</strong> {request.requested_role}</p>
          <p><strong>Message:</strong> {request.message}</p>
          <p><strong>Status:</strong> {request.status}</p>
          <p>
            <strong>Submitted:</strong>{" "}
            {new Date(request.submitted_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default AdminJoinRequests;

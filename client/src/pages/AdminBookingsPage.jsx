import { useEffect, useState } from 'react';
import { fetchPendingBookings, decideBooking } from '../api/bookingsApi';
import { fetchVenues } from '../api/venuesApi';
import '../styles/AdminBookingsPage.css';

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [bks, vs] = await Promise.all([
        fetchPendingBookings(),
        fetchVenues(),
      ]);
      setBookings(bks);
      setVenues(vs);
    } catch {
      setError('Failed to load pending bookings');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = async (id, decision, allocatedVenueId) => {
    try {
      await decideBooking(id, { decision, allocatedVenueId });
      await load();
    } catch {
      setError('Failed to update booking (maybe conflict).');
    }
  };

  return (
    <div className="admin-page page-containe">
      <div className="admin-header">
        <h1>Pending booking requests</h1>
        <p>Review venue requests and approve or reject them.</p>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {bookings.length === 0 ? (
        <p className="admin-empty">No pending requests.</p>
      ) : (
        <ul className="booking-list">
          {bookings.map((b) => (
            <li key={b._id} className="booking-card">
              <div className="booking-main">
                <div className="booking-title">
                  {b.event?.title || 'Untitled event'}
                </div>
                <div className="booking-meta">
                  <span className="badge badge-club">
                    {b.event?.clubOrDept || 'Club / Dept'}
                  </span>
                  <span className="badge badge-time">
                    {new Date(b.startTime).toLocaleString([], {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    –{' '}
                    {new Date(b.endTime).toLocaleString([], {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="booking-row">
                  <span className="label">Requested by</span>
                  <span className="value">
                    {b.requestedBy?.name || 'Unknown'}{' '}
                    {b.requestedBy?.clubOrDept
                      ? `(${b.requestedBy.clubOrDept})`
                      : ''}
                  </span>
                </div>

                <div className="booking-row">
                  <span className="label">Preferred venue</span>
                  <span className="value">
                    {b.preferredVenue?.name || 'No preference'}
                  </span>
                </div>
              </div>

              <div className="booking-actions">
                <label className="venue-label" htmlFor={`venue-${b._id}`}>
                  Allocate venue
                </label>
                <select
                  id={`venue-${b._id}`}
                  className="venue-select"
                  defaultValue={b.preferredVenue?._id || ''}
                >
                  <option value="">-- choose venue --</option>
                  {venues.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name}
                    </option>
                  ))}
                </select>

                <div className="action-buttons">
                  <button
                    type="button"
                    className="btn btn-approve"
                    onClick={() => {
                      const select = document.getElementById(`venue-${b._id}`);
                      const vid = select.value || b.preferredVenue?._id;
                      handleDecision(b._id, 'Approved', vid);
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn btn-reject"
                    onClick={() => handleDecision(b._id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminBookingsPage;

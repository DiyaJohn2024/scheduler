import { useEffect, useState } from 'react';
import { fetchMyBookings } from '../api/bookingsApi';
import '../styles/MyBookingsPage.css';
function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyBookings();
        setBookings(data);
      } catch {
        setError('Failed to load your booking requests');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-msg">Loading booking requests...</div>;
if (error) return <div className="error-msg">{error}</div>;

return (
  <div className="my-bookings-page">
    <div className="my-bookings-card">
      <h1>My Booking Requests</h1>
      {bookings.length === 0 && <p className="no-bookings">No booking requests yet.</p>}
      <ul className="bookings-list">
        {bookings.map((b) => (
          <li key={b._id} className="booking-item">
            <div className="booking-title">{b.event?.title || 'Event'}</div>
            <div className="booking-time">
              {new Date(b.startTime).toLocaleString()} – {new Date(b.endTime).toLocaleString()}
            </div>
            <div className="booking-venue">
              Preferred venue: {b.preferredVenue?.name || 'N/A'}
            </div>
            <div className="booking-status-row">
              <span>Status: </span>
              <strong className={
                b.status === 'Approved' ? 'status-approved' :
                b.status === 'Rejected' ? 'status-rejected' : 'status-pending'
              }>
                {b.status}
              </strong>
              {b.allocatedVenue && (
                <span className="allocated-badge">Allocated: {b.allocatedVenue.name}</span>
              )}
            </div>
            {b.adminComment && (
              <div className="admin-comment">Admin comment: {b.adminComment}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

}

export default MyBookingsPage;

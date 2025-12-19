import { useEffect, useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { fetchEvents } from '../api/eventsApi';
import '../styles/HomePage.css';

const EVENT_TYPES = [
  { value: '', label: 'All events', color: '#ff6b6b' },
  { value: 'technical', label: 'Technical', color: '#4ecdc4' },
  { value: 'cultural', label: 'Cultural', color: '#ffe66d' },
  { value: 'placement', label: 'Placement', color: '#ff8c42' },
  { value: 'workshop', label: 'Workshop', color: '#a8e6cf' },
  { value: 'sports', label: 'Sports', color: '#ff9ff3' },
  { value: 'other', label: 'Other', color: '#95afc0' },
];

function HomePage() {
  const [events, setEvents] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // load events whenever filter changes
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchEvents(selectedType || undefined);
        setEvents(data);
        setError('');
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedType]);

  // events grouped by date (yyyy-mm-dd), covering full date range
  const eventsByDate = useMemo(() => {
    const map = {};

    events.forEach((ev) => {
      const start = new Date(ev.startTime);
      const end = new Date(ev.endTime);

      // normalize to midnight for looping
      let current = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const lastDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      while (current <= lastDay) {
        const dateKey = current.toISOString().slice(0, 10);
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(ev);

        current.setDate(current.getDate() + 1);
      }
    });

  return map;
}, [events]);


  const dayEvents = useMemo(() => {
    const key = selectedDate.toISOString().slice(0, 10);
    return eventsByDate[key] || [];
  }, [selectedDate, eventsByDate]);

  const handleDayClick = (date) => {
    const eventsOnDate = eventsByDate[date.toISOString().slice(0, 10)] || [];
    if (eventsOnDate.length > 0) {
      setSelectedDate(date);
      setShowModal(true);
    }
  };

  const getEventColor = (eventType) => {
    const type = EVENT_TYPES.find(t => t.value === eventType);
    return type ? type.color : '#95afc0';
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="homepage">
      {/* Filter bar - Color dots + labels */}
      <div className="filter-bar">
        {EVENT_TYPES.map((t) => (
          <button
            key={t.value || 'all'}
            onClick={() => setSelectedType(t.value)}
            className={`filter-btn ${selectedType === t.value ? 'active' : ''}`}
            style={{ '--btn-color': t.color }}
            >
            {t.label}
            </button>
        ))}
      </div>

      {/* Calendar - 7 columns fixed */}
      <div className="calendar-container">
        <Calendar
          value={selectedDate}
          onClickDay={handleDayClick}
          onActiveStartDateChange={({ activeStartDate }) => setCurrentMonth(activeStartDate)}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;
            const key = date.toISOString().slice(0, 10);
            const dayEvs = eventsByDate[key] || [];
            if (dayEvs.length === 0) return null;

            // Show colored circles for ALL unique event types on that day
            const uniqueTypes = [...new Set(dayEvs.map(ev => ev.type).filter(Boolean))];
            return (
              <div className="tile-dots">
                {uniqueTypes.slice(0, 4).map((type) => (
                  <span
                    key={type}
                    className="tile-dot"
                    style={{ backgroundColor: getEventColor(type) }}
                  />
                ))}
              </div>
            );
          }}
        />
      </div>

      {/* Event Details Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                Events on {selectedDate.toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
  {dayEvents.length === 0 ? (
    <p>No events on this day.</p>
  ) : (
    <div className="events-list">
      {dayEvents.map((ev) => (
        <div key={ev._id} className="event-item">
          <div className="event-title">{ev.title}</div>

          <div className="event-time">
            <span
              className="event-circle-small"
              style={{ backgroundColor: getEventColor(ev.type) }}
            />
            {new Date(ev.startTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            –{' '}
            {new Date(ev.endTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {ev.type && (
              <span
                className="event-type"
                style={{ color: getEventColor(ev.type) }}
              >
                {ev.type}
              </span>
            )}
          </div>

          <div className="event-venue">
            Venue:{' '}
            {ev.confirmedVenue && ev.confirmedVenue.name
              ? ev.confirmedVenue.name
              : 'Not yet decided'}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;

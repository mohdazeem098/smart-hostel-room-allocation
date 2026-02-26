import { useState, useEffect } from "react";
import "./App.css";

const APP_VERSION = "v1.1.0";

function App() {

  // ---------------- STATE ----------------

  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [hasAC, setHasAC] = useState(false);
  const [hasAttachedWashroom, setHasAttachedWashroom] = useState(false);
  
  const [rooms, setRooms] = useState(() => {
    const savedRooms = localStorage.getItem("rooms");
    return savedRooms ? JSON.parse(savedRooms) : [];
  });

  const [message, setMessage] = useState("");
  const [roomError, setRoomError] = useState("");
  
  const [students, setStudents] = useState("");
  const [needsAC, setNeedsAC] = useState(false);
  const [needsWashroom, setNeedsWashroom] = useState(false);
  const [allocationResult, setAllocationResult] = useState(null);
  const [allocationError, setAllocationError] = useState("");

  const [searchCapacity, setSearchCapacity] = useState("");
  const [searchAC, setSearchAC] = useState(false);
  const [searchWashroom, setSearchWashroom] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // ---------------- EFFECTS ----------------

  useEffect(() => {
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }, [rooms]);

  // Clear search results when rooms change (better UX)
  useEffect(() => {
    setSearchResults([]);
  }, [rooms]);

  // ---------------- ADD ROOM ----------------
  
  const handleAddRoom = (e) => {
    e.preventDefault();

    setRoomError("");
    setMessage("");

    // Room number required
    if (!roomNumber.trim()) {
      setRoomError("Room number is required.");
      return;
    }

    // Capacity must be > 0
    if (!capacity || Number(capacity) <= 0) {
      setRoomError("Capacity must be greater than 0.");
      return;
    }

    // Duplicate check (case insensitive)
    const duplicate = rooms.find(
      (room) =>
        room.roomNumber.toLowerCase().trim() === roomNumber.toLowerCase().trim()
    );

    if (duplicate) {
      setRoomError("Room number already exists.");
      return;
    }

    const newRoom = {
      id: Date.now(),
      roomNumber,
      capacity: Number(capacity),
      hasAC,
      hasAttachedWashroom,
      isAllocated: false,   // ✅ NEW
    };

    setRooms([...rooms, newRoom]);
    setAllocationResult(null);
    setMessage("Room added successfully");

    // Clear form
    setRoomNumber("");
    setCapacity("");
    setHasAC(false);
    setHasAttachedWashroom(false);
  };

  // ---------------- SEARCH ROOMS ----------------

  const handleSearch = () => {
    const filteredRooms = rooms.filter((room) => {
      if (searchCapacity && room.capacity < Number(searchCapacity)) return false;
      if (searchAC && !room.hasAC) return false;
      if (searchWashroom && !room.hasAttachedWashroom) return false;
      return true;
    });

    setAllocationResult(null);
    setSearchResults(filteredRooms);
  };

  // ---------------- ALLOCATE ROOM ----------------

  const allocateRoom = (students, needsAC, needsWashroom) => {
    const suitableRooms = rooms
      .filter((room) => {
        if (room.isAllocated) return false;   // ✅ NEW
        if (room.capacity < students) return false;
        if (needsAC && !room.hasAC) return false;
        if (needsWashroom && !room.hasAttachedWashroom) return false;
        return true;
      })
      .sort((a, b) => a.capacity - b.capacity);

    if (suitableRooms.length === 0) {
      setAllocationResult({
        success: false,
        message: "No room available",
      });
      return;
    }

    // ✅ NEW LOGIC STARTS HERE
    const allocatedRoom = suitableRooms[0];

    const updatedRooms = rooms.map((room) =>
      room.id === allocatedRoom.id
        ? { ...room, isAllocated: true }
        : room
    );

    setRooms(updatedRooms);

    setAllocationResult({
      success: true,
      room: allocatedRoom,
    });
  };

  // ---------------- DELETE ROOM ----------------

  const handleDeleteRoom = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmDelete) return;

    const updatedRooms = rooms.filter((room) => room.id !== id);
    setRooms(updatedRooms);
    setAllocationResult(null);
    setMessage("Room deleted successfully");
  };

  const handleClearAllRooms = () => {
  const confirmClear = window.confirm(
    "Are you sure you want to delete ALL rooms?"
  );

  if (!confirmClear) return;

  setRooms([]);
  setAllocationResult(null);
  setMessage("All rooms cleared successfully");
};

// ---------------- ROOM STATISTICS ----------------

const totalRooms = rooms.length;
const allocatedRooms = rooms.filter((room) => room.isAllocated).length;
const availableRooms = totalRooms - allocatedRooms;

// ---------------- UI ----------------

  return (
    <div className="container">
      <h2>Smart Hostel Room Allocation</h2>

      <p className="version">Version {APP_VERSION}</p>

      <p className="room-count">Total Rooms: {rooms.length}</p>
      <button className="clear-btn" onClick={handleClearAllRooms}>
        Clear All Rooms
      </button>


      {/* ---------------- ADD ROOM ---------------- */}
      
      <h3>Add Room</h3>

      <form onSubmit={handleAddRoom} className="form-group">
        <input
          type="text"
          placeholder="Room Number"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
        />

        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />

        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={hasAC}
            onChange={(e) => setHasAC(e.target.checked)}
          />
          AC Available
        </label>

        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={hasAttachedWashroom}
            onChange={(e) => setHasAttachedWashroom(e.target.checked)}
          />
          Attached Washroom
        </label>

        <button type="submit">Add Room</button>
      </form>

      {message && <p className="message">{message}</p>}

      {roomError && (
        <p style={{ color: "red" }}>{roomError}</p>
      )}

      {/* ---------------- DASHBOARD ---------------- */}

      <div className="dashboard">
        <div className="card">
          <h3>Total Rooms</h3>
          <p>{totalRooms}</p>
        </div>

        <div className="card allocated">
          <h3>Allocated</h3>
          <p>{allocatedRooms}</p>
        </div>

        <div className="card available">
          <h3>Available</h3>
          <p>{availableRooms}</p>
        </div>
      </div>

      {/* ---------------- ROOM LIST ---------------- */}

      <h3>Room List</h3>

      {rooms.length === 0 ? (
        <p>No rooms added yet.</p>
      ) : (
        <ul className="room-list">
          {rooms.map((room) => (
            <li key={room.id} className="room-item">
              <span>
                Room {room.roomNumber} | Capacity: {room.capacity} |{" "}
                {room.hasAC ? "AC" : "Non-AC"} |{" "}
                {room.hasAttachedWashroom ? "Attached Washroom" : "Common Washroom"} |{" "}
Status: {room.isAllocated ? "Allocated" : "Available"}
              </span>

              <button
                className="delete-btn"
                onClick={() => handleDeleteRoom(room.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ---------------- SEARCH ---------------- */}

      <h3>Search Rooms</h3>

      <div className="form-group">
        <input
          type="number"
          placeholder="Minimum Capacity"
          value={searchCapacity}
          onChange={(e) => setSearchCapacity(e.target.value)}
        />

        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={searchAC}
            onChange={(e) => setSearchAC(e.target.checked)}
          />
          AC Required
        </label>

        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={searchWashroom}
            onChange={(e) => setSearchWashroom(e.target.checked)}
          />
          Attached Washroom Required
        </label>

        <button onClick={handleSearch}>Search</button>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h4>Matching Rooms:</h4>
          <ul>
            {searchResults.map((room) => (
              <li key={room.id}>
                Room {room.roomNumber} | Capacity: {room.capacity} |{" "}
                {room.hasAC ? "AC" : "Non-AC"} |{" "}
                {room.hasAttachedWashroom
                  ? "Attached Washroom"
                  : "Common Washroom"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {searchResults.length === 0 && (searchCapacity || searchAC || searchWashroom) && (
        <p className="error" style={{ color: "red" }}>No matching rooms found.</p>
      )}

      {/* ---------------- ALLOCATION ---------------- */}

      <h3>Allocate Room</h3>

      <div className="form-group">
        <input
          type="number"
          placeholder="Number of Students"
          value={students}
          onChange={(e) => setStudents(e.target.value)}
        />

        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={needsAC}
            onChange={(e) => setNeedsAC(e.target.checked)}
          />
          AC Required
        </label>

        <label className="checkbox-group">
          <input
            type="checkbox"
            checked={needsWashroom}
            onChange={(e) => setNeedsWashroom(e.target.checked)}
          />
          Attached Washroom Required
        </label>

        <button
          disabled={!students || Number(students) <= 0}
          onClick={() => {
            setAllocationError("");
            setAllocationResult(null);

            if (!students || Number(students) <= 0) {
              setAllocationError("Please enter a valid number of students.");
              return;
            }

            allocateRoom(Number(students), needsAC, needsWashroom);
          }}
        >
          Allocate
        </button>
      </div>

      {allocationResult && (
        <div className={`allocation-result ${allocationResult.success ? "success" : "error"}`}>
          {allocationResult.success ? (
            <>
              <p><strong>Room Allocated Successfully</strong></p>
              <p>
                Room No: {allocationResult.room.roomNumber}<br />
                Capacity: {allocationResult.room.capacity}<br />
                {allocationResult.room.hasAC ? "AC Available" : "Non-AC"}<br />
                {allocationResult.room.hasAttachedWashroom
                  ? "Attached Washroom"
                  : "Common Washroom"}
              </p>
            </>
          ) : (
            <p>{allocationResult.message}</p>
          )}
        </div>
      )}

      {allocationError && (
        <p className="error" style={{ color: "red" }}>{allocationError}</p>
      )}

      {/* ---------------- FOOTER ---------------- */}

      <footer className="footer">
        © 2026 Mohd Azeem | Smart Hostel Room Allocation | Version {APP_VERSION}
      </footer>

    </div>
  );
}

export default App;

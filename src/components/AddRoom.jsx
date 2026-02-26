import { useState } from "react";

export default function AddRoom({ rooms, setRooms }) {
  const [roomNo, setRoomNo] = useState("");
  const [capacity, setCapacity] = useState("");
  const [hasAC, setHasAC] = useState(false);
  const [hasWashroom, setHasWashroom] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roomNo || capacity <= 0) {
      setError("Please enter valid room number and capacity.");
      return;
    }

    const roomExists = rooms.some((r) => r.roomNo === roomNo);
    if (roomExists) {
      setError("Room number already exists.");
      return;
    }

    const newRoom = {
      roomNo,
      capacity: Number(capacity),
      hasAC,
      hasAttachedWashroom: hasWashroom,
    };

    setRooms([...rooms, newRoom]);
    setRoomNo("");
    setCapacity("");
    setHasAC(false);
    setHasWashroom(false);
    setError("");
  };

  return (
    <section>
      <h2>Add Room</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Room Number:</label>
          <input
            type="text"
            value={roomNo}
            onChange={(e) => setRoomNo(e.target.value)}
          />
        </div>

        <div>
          <label>Capacity:</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={hasAC}
              onChange={(e) => setHasAC(e.target.checked)}
            />
            Has AC
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={hasWashroom}
              onChange={(e) => setHasWashroom(e.target.checked)}
            />
            Attached Washroom
          </label>
        </div>

        <button type="submit">Add Room</button>
      </form>
    </section>
  );
}

import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { useAuth } from "../store/auth";
import { IoMdClose } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import Loader from "../components/Loader";

const statusClasses = {
  scheduled: "bg-blue-100 text-blue-600",
  canceled: "bg-red-100 text-red-600",
  completed: "bg-green-100 text-green-600",
  reschedule: "bg-gray-200 text-gray-500",
};

const CalendarScheduler = () => {
  const { URI, showNotePopup, setShowNotePopup } = useAuth();

  const [tab, setTab] = useState("meetings"); // Meetings | Notes
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [meetings, setMeetings] = useState([]);
  const [notes, setNotes] = useState([]);

  const [newNote, setNewNote] = useState("");
  const [noteTime, setNoteTime] = useState("09:00");

  // ---------------- Fetch Meetings ----------------
  const fetchMeetings = async () => {
    try {
      const response = await fetch(URI + "/admin/calender/meetings", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setMeetings(data);
    } catch (err) {
      console.error("Error fetching Meetings:", err);
    }
  };

  // ---------------- Fetch Notes ----------------
  const fetchNotes = async (selectedDate = null) => {
    try {
      let url = `${URI}/admin/calender/notes`;

      // Add date filter if date selected
      if (selectedDate) {
        const formatted = format(selectedDate, "yyyy-MM-dd");
        url += `?date=${formatted}`;
      }

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch notes");

      const data = await response.json();
      //console.log(data);

      setNotes(data);
    } catch (err) {
      console.error("Error fetching Notes:", err);
    }
  };

  // ---------------- Add Notes ----------------
  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const payload = {
      date: format(selectedDate, "yyyy-MM-dd"),
      time: noteTime,
      note: newNote,
    };

    try {
      await fetch(URI + "/admin/calender/note/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      setNewNote("");
      setShowNotePopup(false);
      fetchNotes(); // Refresh notes
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  // ---------------- Delete Note ----------------
  const deleteNote = async (noteId) => {
    if (!window.confirm("Are you sure to delete this Note?")) return;
    try {
      const response = await fetch(
        `${URI}/admin/calender/note/delete/${noteId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== noteId));
        //alert("Note deleted successfully");
      } else {
        alert(data.message || "Failed to delete note");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchNotes(selectedDate);
  }, []);

  useEffect(() => {
    //fetchMeetings();
    if (selectedDate) {
      fetchNotes(selectedDate);
    }
  }, [selectedDate]);

  // ---------------- Calendar Dot Logic ----------------
  const tileContent = ({ date, view }) => {
    const dateStr = format(date, "yyyy-MM-dd");

    if (view === "month") {
      let hasMeeting = meetings.some(
        (m) => format(new Date(m.visitdate), "yyyy-MM-dd") === dateStr
      );

      let hasNotes = notes.some((n) => n.date === dateStr);

      if (!hasMeeting && !hasNotes) return null;

      return (
        <div className="flex justify-center mt-1 gap-1">
          {hasMeeting && (
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          )}
          {hasNotes && (
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          )}
        </div>
      );
    }
  };

  // ---------------- Filter Data ----------------
  const dailyMeetings = meetings?.filter(
    (m) =>
      format(new Date(m.visitdate), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
  );

  const dailyNotes = notes?.filter(
    (n) => n.date === format(selectedDate, "dd MMM yyyy")
  );

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {/* ---------------- Tabs ---------------- */}
      <div className="flex w-full border-b bg-white">
        <button
          onClick={() => setTab("meetings")}
          className={`w-1/2 p-3 text-center font-semibold ${
            tab === "meetings"
              ? "border-b-2 border-green-600 text-green-600"
              : ""
          }`}
        >
          Meetings
        </button>

        <button
          onClick={() => setTab("notes")}
          className={`w-1/2 p-3 text-center font-semibold ${
            tab === "notes" ? "border-b-2 border-green-600 text-green-600" : ""
          }`}
        >
          Notes
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-gray-50 p-4">
        <div className="flex flex-col md:flex-row gap-4 h-full overflow-scroll scrollbar-hide">
          {/* Calendar Section */}
          <div>
            <Calendar
              onChange={(date) => {
                setSelectedDate(format(date, "yyyy-MM-dd"));
              }}
              value={selectedDate}
              locale="en-US"
              tileContent={tileContent}
              showNeighboringMonth={false}
              formatShortWeekday={(locale, date) => format(date, "E").charAt(0)}
              className="min-w-[300px] md:min-w-[350px] rounded-lg border border-gray-300 p-4 shadow-md"
              tileClassName={({ date, view }) => {
                if (view === "month") {
                  const today = new Date();
                  const isToday =
                    format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

                  if (isToday) {
                    return "border-2 border-green-500 bg-transparent font-bold text-black";
                  }
                }
                return "";
              }}
            />
          </div>

          {/* ---------------- Meetings Tab ---------------- */}
          {tab === "meetings" && (
            <div className="w-full min-w-[300px] md:min-w-[450px] bg-white rounded-xl p-4 shadow max-h-[75vh] overflow-y-auto no-scrollbar">
              {dailyMeetings?.length === 0 && (
                <p className="text-gray-500 text-center mt-10">
                  No meetings today
                </p>
              )}

              {dailyMeetings?.map((meeting, index) => (
                <div
                  key={meeting.followupid}
                  className="flex justify-between items-start p-4 border-b"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-xs text-gray-500">Project Visit</span>
                    <p className="text-xl font-semibold">
                      {format(new Date(meeting.visitdate), "MMM dd")}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-xs text-gray-500">Project Name</span>
                    <p className="font-semibold">{meeting.propertyName}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-500 mb-2">
                      Customer Name
                    </span>
                    <p className="font-semibold">{meeting.customer}</p>
                    <p className="text-blue-500 cursor-pointer">
                      {meeting.contact}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-xs text-gray-500">
                      Sales Person Name
                    </span>
                    <p className="font-semibold">{meeting.fullname}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-xs text-gray-500">Remark</span>
                    <p className="font-semibold">{meeting.remark}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-xs text-gray-500">Status</span>
                    <button
                      className={`px-3 py-1 rounded-full text-sm ${
                        statusClasses[meeting.status]
                      } font-semibold`}
                    >
                      {meeting.status === "scheduled"
                        ? "Visit Schedule"
                        : meeting.status === "canceled"
                        ? "Visit Cancelled"
                        : meeting.status === "reschedule"
                        ? "Visit Reschedule"
                        : meeting.status === "completed"
                        ? "Visited"
                        : ""}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------------- Notes Tab ---------------- */}
          {tab === "notes" && (
            <div className="w-full min-w-[300px] md:min-width-[350px] bg-white rounded-xl p-4 shadow max-h-[75vh] flex flex-col scrollbar-hide">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-base md:text-lg text-gray-700">
                  Notes
                </h2>

                <button
                  onClick={() => setShowNotePopup(true)}
                  className="px-4 py-2 bg-green-600 font-semibold text-white rounded-lg"
                >
                  Add Note +
                </button>
              </div>

              <div className="flex-1 overflow-scroll scrollbar-hide">
                {dailyNotes?.length === 0 ? (
                  <p className="text-gray-500 text-center mt-10">
                    No notes for this date
                  </p>
                ) : (
                  dailyNotes?.map((n, i) => (
                    <div
                      key={i}
                      className="w-full items-center justify-between  p-3 border-b flex flex-row items "
                    >
                      <div>
                        <p className="text-sm text-gray-500">
                          {n.date + " | " + (n.time ? n.time : "09:00")}
                        </p>
                        <p className="font-medium mt-1">{n.note}</p>
                      </div>
                      <MdDelete
                        onClick={() => {
                          deleteNote(n.id);
                        }}
                        className="text-red-500 w-5 md:w-7 h-5 md:h-7 cursor-pointer active:scale-95"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`${
          showNotePopup ? "flex" : "hidden"
        } z-[61] roleForm overflow-scroll scrollbar-hide w-full fixed bottom-0 md:bottom-auto `}
      >
        <div className="w-full md:w-[500px] overflow-scroll scrollbar-hide max-h-[75vh] bg-white py-8 pb-16 px-4 sm:px-6 border border-[#cfcfcf33] rounded-tl-lg rounded-tr-lg md:rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold">
              Add Note – {format(selectedDate, "dd MMM yyyy")}
            </h2>
            <IoMdClose
              onClick={() => {
                setShowNotePopup(false);
              }}
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <form onSubmit={addNote}>
            <div className="w-full grid gap-4 place-items-center grid-cols-1">
              {/* ---- Time Selector ---- */}
              <div className="w-full">
                <label className="block mb-1 font-medium text-sm text-[#00000060]">
                  Select Time
                </label>
                <input
                  type="time"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={noteTime}
                  onChange={(e) => setNoteTime(e.target.value)}
                />
              </div>

              <textarea
                rows={4}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Write note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>
            <div className="flex mt-8 md:mt-6 justify-end gap-6">
              <button
                type="button"
                onClick={() => {
                  setShowNotePopup(false);
                }}
                className="px-4 py-2 leading-4 text-[#ffffff] bg-[#000000B2] rounded active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-[#076300] rounded active:scale-[0.98]"
              >
                {"ADD"}
              </button>
              <Loader></Loader>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduler;

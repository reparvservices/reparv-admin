import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import CustomDateRangePicker from "../components/CustomDateRangePicker";
import { useAuth } from "../store/auth";

const statusClasses = {
  scheduled: "bg-blue-100 text-blue-600",
  canceled: "bg-red-100 text-red-600",
  completed: "bg-green-100 text-green-600",
  reschedule: "bg-gray-200 text-gray-500",
};

const CalendarScheduler = () => {
  const { URI } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);

  //Fetch Data
  const fetchData = async () => {
    try {
      const response = await fetch(URI + "/admin/calender/meetings", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch Meetings.");
      const data = await response.json();
      setMeetings(data);
      console.log(data);
    } catch (err) {
      console.error("Error fetching :", err);
    }
  };

  // Add meeting status dots
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateString = format(date, "yyyy-MM-dd");
      const meeting = meetings.find(
        (meeting) =>
          format(new Date(meeting.visitdate), "yyyy-MM-dd") === dateString
      );

      if (meeting) {
        return (
          <div
            className={`w-2 h-2 rounded-full mx-auto ${
              meeting.status === "scheduled"
                ? "bg-blue-500"
                : meeting.status === "canceled"
                ? "bg-red-500"
                : meeting.status === "reschedule"
                ? "bg-gray-500"
                : meeting.status === "completed"
                ? "bg-green-500"
                : "bg-yellow-500"
            }`}
          ></div>
        );
      }
    }
    return null;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="calender overflow-scroll scrollbar-hide w-full h-screen flex flex-col items-start justify-start ">
      <div className="calender overflow-scroll scrollbar-hide w-full h-[80vh] flex flex-col px-4 md:px-6 py-6 gap-4 my-[10px] bg-white rounded-[24px]">
        <div className="w-full flex items-end justify-start px-2">
          <p className="block text-lg font-semibold">Meetings</p>
          {/*<CustomDateRangePicker></CustomDateRangePicker>*/}
        </div>
        <div className="w-full flex gap-6">
          {/* Calendar Section */}
          <div>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              locale="en-US"
              tileContent={tileContent}
              showNeighboringMonth={false} //  Hides previous & next month dates
              formatShortWeekday={(locale, date) => format(date, "E").charAt(0)}
              className="min-w-[300px] rounded-lg border border-gray-300 p-4 w-full shadow-md"
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

          {/* Meetings List Section */}
          <div className="w-full min-w-[761px] max-w-6xl bg-white p-4 ">
            {meetings
              .filter(
                (meeting) =>
                  format(new Date(meeting.visitdate), "yyyy-MM-dd") ===
                  format(selectedDate, "yyyy-MM-dd")
              )
              .map((meeting, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduler;

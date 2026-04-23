import { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  LayoutGrid, 
  List, 
  Maximize2 
} from "lucide-react";

// API importlaringiz
import { getAllGroups, getAllRooms } from "../../api/groups";
import { getAllTeachers } from "../../api/teacher";
import { getStudents } from "../../api/students";

// ─── CONSTANTS ────────────────────────────────────────────────
const DAYS = [
  { key: "Yak", label: "Yak" }, { key: "Du", label: "Du" },
  { key: "Se", label: "Se" }, { key: "Chor", label: "Chor" },
  { key: "Pa", label: "Pa" }, { key: "Ju", label: "Ju" }, { key: "Sha", label: "Sha" },
];

const TIME_SLOTS = [];
for (let h = 6; h < 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00 - ${String(h).padStart(2, "0")}:30`);
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30 - ${String(h + 1).padStart(2, "0")}:00`);
}

// ─── HELPERS ──────────────────────────────────────────────────
const timeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const slotStartMinutes = (slot) => timeToMinutes(slot.split(" - ")[0]);

export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState("Sha");
  const [viewMode, setViewMode] = useState("room");
  const [data, setData] = useState({ groups: [], teachers: [], students: [], rooms: [] });

  useEffect(() => {
    Promise.all([getAllGroups(), getAllTeachers(), getStudents(), getAllRooms()])
      .then(([gRes, tRes, sRes, rRes]) => {
        const gData = gRes.data?.data ?? gRes.data ?? [];
        const tData = tRes.data?.data ?? tRes.data ?? [];
        const sData = sRes.data?.data ?? sRes.data ?? [];
        const rData = rRes.data?.data ?? rRes.data ?? [];

        console.log('API Response - Groups:', gData);
        console.log('API Response - Teachers:', tData);
        console.log('API Response - Rooms:', rData);

        const mappedGroups = gData.map((g) => {
          const teacher = tData.find(t => (t._id || t.id) === g.teacherId);
          const room = rData.find(r => (r._id || r.id) === g.roomId);
          return {
            ...g,
            teacherName: teacher?.name ?? "",
            roomName: room?.name ?? "",
          };
        });

        console.log('Mapped Groups:', mappedGroups);

        setData({
          groups: mappedGroups,
          teachers: tData, students: sData, rooms: rData
        });
      });
  }, []);

  const columns = useMemo(() => viewMode === "room" ? data.rooms : data.teachers, [viewMode, data]);
  const dayGroups = useMemo(() => {
    const filtered = data.groups.filter(g => g.schedule?.days?.includes(selectedDay));
    console.log('Selected Day:', selectedDay);
    console.log('All Groups:', data.groups);
    console.log('Filtered Groups for day:', filtered);
    console.log('Columns (rooms/teachers):', columns);
    console.log('View Mode:', viewMode);

    return filtered;
  }, [data.groups, selectedDay, columns, viewMode]);

  const getGroupStyles = (groupName) => {
    if (groupName?.startsWith("EKY")) return "bg-[#4ADE80] text-white";
    if (groupName?.startsWith("EMU")) return "bg-[#000000] text-white";
    if (groupName?.startsWith("OON") || groupName?.startsWith("OSS")) return "bg-[#2DD4BF] text-white";
    if (groupName?.startsWith("TXA")) return "bg-[#EF4444] text-white";
    if (groupName?.startsWith("EMA")) return "bg-[#7F1D1D] text-white";
    return "bg-[#FACC15] text-black";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-900">

      {/* ── HEADER (Soddalashtirilgan) ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dars jadvali</h1>
        <p className="text-sm text-gray-500 mt-1">CRM tizimi</p>
      </div>

      {/* ── STATS GRID (Faqat so'ralganlar) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10"><Users className="w-5 h-5 text-emerald-600" /></div>
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase leading-none mb-1">O'quvchilar</p>
            <h4 className="text-lg font-bold text-gray-900">{data.students.length}</h4>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10"><UserCheck className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase leading-none mb-1">O'qituvchilar</p>
            <h4 className="text-lg font-bold text-gray-900">{data.teachers.length}</h4>
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10"><UserMinus className="w-5 h-5 text-red-600" /></div>
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase leading-none mb-1">Kelmaganlar</p>
            <h4 className="text-lg font-bold text-gray-900">0</h4>
          </div>
        </div>

        {/* BO'SH KARTA (Keyinchalik qo'shish uchun) */}
        <div className="bg-white/50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center">
          <span className="text-[10px] text-gray-400 font-medium">Bo'sh joy</span>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="bg-white border border-gray-200 p-3 rounded-xl flex justify-between items-center mb-4 shadow-sm">
        <div className="flex gap-1 flex-wrap">
          {DAYS.map(d => (
            <button key={d.key} onClick={() => setSelectedDay(d.key)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${selectedDay === d.key ? "bg-[#4F46E5] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
            >{d.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode("room")} className={`px-4 py-1.5 rounded-md text-xs font-bold ${viewMode === "room" ? "bg-[#4F46E5] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>Xona</button>
            <button onClick={() => setViewMode("teacher")} className={`px-4 py-1.5 rounded-md text-xs font-bold ${viewMode === "teacher" ? "bg-[#4F46E5] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>Ustoz</button>
          </div>
          <div className="flex gap-2 border-l border-gray-300 pl-3">
            <LayoutGrid className="w-4 h-4 text-indigo-600" />
            <List className="w-4 h-4 text-gray-400" />
            <Maximize2 className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-r border-b border-gray-200 w-24 sticky left-0 bg-gray-100 z-30 text-xs font-bold text-gray-600 uppercase text-center">Vaqt</th>
                {columns.map((col, idx) => (
                  <th key={col._id || col.id} className="p-3 border-r border-b border-gray-200 min-w-[150px] text-center text-xs font-bold text-gray-900">
                    {col.name || (idx + 1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, slotIdx) => (
                <tr key={slot} className="hover:bg-gray-50/50">
                  <td className="p-3 border-r border-b border-gray-200 text-center text-xs font-semibold text-gray-600 bg-white sticky left-0 z-10">{slot}</td>
                  {columns.map(col => {
                    const colId = col._id || col.id;
                    const slotTime = slotStartMinutes(slot);

                    // Find group that starts at this slot
                    const group = dayGroups.find(g =>
                      (viewMode === "room" ? g.roomId === colId : g.teacherId === colId) &&
                      g.schedule?.fromHour &&
                      slotTime === timeToMinutes(g.schedule.fromHour)
                    );

                    // Check if this slot is occupied by a group that started earlier
                    const isOccupied = dayGroups.some(g =>
                      (viewMode === "room" ? g.roomId === colId : g.teacherId === colId) &&
                      g.schedule?.fromHour &&
                      g.schedule?.toHour &&
                      slotTime > timeToMinutes(g.schedule.fromHour) &&
                      slotTime < timeToMinutes(g.schedule.toHour)
                    );

                    // Skip cell if occupied (it's part of a rowspan)
                    if (isOccupied) {
                      return null;
                    }

                    // If group found, render it with rowspan
                    if (group && group.schedule?.toHour) {
                      const fromMinutes = timeToMinutes(group.schedule.fromHour);
                      const toMinutes = timeToMinutes(group.schedule.toHour);
                      const span = Math.max(1, (toMinutes - fromMinutes) / 30);

                      return (
                        <td
                          key={`${colId}-${slotIdx}`}
                          rowSpan={span}
                          className={`p-3 align-top border-2 border-white shadow-sm z-10 rounded-xl ${getGroupStyles(group.name)}`}
                        >
                          <div className="text-xs font-bold truncate leading-tight mb-1">{group.name}</div>
                          <div className="text-xs font-medium opacity-90 truncate">{group.teacherName}</div>
                          <div className="text-[10px] opacity-75 mb-1 italic">Xona: {group.roomName}</div>
                          <div className="inline-flex bg-white/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            👥 {group.studentCount || group.currentStudents || 0}/{group.maxStudents}
                          </div>
                        </td>
                      );
                    }

                    // Empty cell
                    return (
                      <td
                        key={`${colId}-${slotIdx}`}
                        className="border-r border-b border-gray-200 text-center text-gray-400 text-xs"
                      >
                        —
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
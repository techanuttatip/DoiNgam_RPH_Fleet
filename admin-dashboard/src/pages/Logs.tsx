import { useState, useEffect } from "react";
import { FileText, Download, Printer, Calendar, Car, User } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Event } from "../types/database";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { registerThaiFont } from "../utils/thaiFont";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { th } from "date-fns/locale";
import Swal from "sweetalert2";

// ลงทะเบียนฟอนต์ภาษาไทย
registerThaiFont();

export default function Logs() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  useEffect(() => {
    fetchEvents();
  }, [selectedMonth]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // ปรับการดึงข้อมูลให้ครอบคลุมทั้งเดือนที่เลือก
      const date = new Date(selectedMonth + "-01");
      const firstDay = startOfMonth(date).toISOString();
      const lastDay = endOfMonth(date).toISOString();

      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          vehicle:vehicles(*),
          participants:event_participants(user:profiles(*))
        `
        )
        .gte("start_time", firstDay)
        .lte("start_time", lastDay)
        .order("start_time", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error("Error:", error);
      Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- แบบ 3 (ใบขออนุญาตรายครั้ง) ---
  const printForm3 = (event: Event) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("THSarabunNew");
  doc.setFontSize(16);

  const centerX = 105;

  /* =========================
     DOT FIELD ENGINE
  ========================= */

  const dotField = (
    x: number,
    y: number,
    width: number,
    value?: string,
    align: "left" | "center" = "center"
  ) => {
    const dot = ".";
    let dots = "";

    while (doc.getTextWidth(dots + dot) < width) {
      dots += dot;
    }

    doc.text(dots, x, y);

    if (!value) return;

    let text = value;
    while (doc.getTextWidth(text) > width - 2) {
      text = text.slice(0, -1);
    }

    let textX = x;
    if (align === "center") {
      textX = x + width / 2 - doc.getTextWidth(text) / 2;
    } else {
      textX = x + 1;
    }

    doc.text(text, textX, y);
  };

  /* =========================
     HEADER (ชิดบนมากขึ้น)
  ========================= */

  doc.text("แบบ 3", 200, 10, { align: "right" });

  doc.setFontSize(22);
  doc.text("ใบขออนุญาตใช้รถส่วนกลาง", centerX, 18, { align: "center" });
  doc.setFontSize(16);

  const requestDate = new Date(event.request_date || event.start_time);
  const buddhistYear =
    parseInt(format(requestDate, "yyyy")) + 543;

  doc.text(
    `วันที่ ${format(requestDate, "d")} เดือน ${format(
      requestDate,
      "MMMM",
      { locale: th }
    )} พ.ศ. ${buddhistYear}`,
    centerX,
    26,
    { align: "center" }
  );

  /* =========================
     BODY
  ========================= */

  doc.text("เรียน  ผู้อำนวยการ รพ.สต. ดอยงาม", 20, 38);

  const requester =
    event.participants?.[0]?.user.full_name || "";
  const position =
    event.participants?.[0]?.user.position || "";

  doc.text("ข้าพเจ้า", 50, 48);
  dotField(61, 48, 60, requester);

  doc.text("ตำแหน่ง", 120, 48);
  dotField(133, 48, 60, position);

  doc.text("ขออนุญาตใช้รถ หมายเลขทะเบียน ผฉ 293 เชียงราย", 20, 58);

  doc.text("ไปที่ไหน (ระบุ)", 20, 68);
  dotField(40, 68, 155, event.title, "center");

  /* ===== เพื่อ + มีคนนั่ง (รวมบรรทัดเดียว) ===== */

  doc.text("เพื่อ", 20, 78);
  dotField(25, 78, 100, event.description, "left");

  doc.text("มีคนนั่ง", 130, 78);
  dotField(160, 78, 20);
  doc.text("คน", 160, 78);

  const start = new Date(event.start_time);
  const end = new Date(event.end_time);

  doc.text("ไปในวันที่", 20, 100);
  dotField(
    45,
    100,
    70,
    format(start, "d MMMM yyyy", { locale: th })
  );

  doc.text("เวลา", 120, 100);
  dotField(135, 100, 25, format(start, "HH:mm"));
  doc.text("น.", 162, 100);

  doc.text("กลับวันที่", 20, 110);
  dotField(
    45,
    110,
    70,
    format(end, "d MMMM yyyy", { locale: th })
  );

  doc.text("เวลา", 120, 110);
  dotField(135, 110, 25, format(end, "HH:mm"));
  doc.text("น.", 162, 110);

  /* ===== ลายเซ็น ===== */

  dotField(70, 130, 70);
  doc.text("ผู้ขออนุญาต", 145, 130);

  doc.text("ความเห็น", 20, 145);
  doc.text("(    ) อนุมัติ", 25, 155);
  doc.text("(    ) ไม่อนุมัติ", 60, 155);
  doc.text("ระบุเหตุผล", 110, 155);
  dotField(135, 155, 55);

  doc.text("ลงนามผู้มีอำนาจสั่งใช้รถ", 20, 175);
  dotField(75, 175, 90);

  dotField(60, 185, 90);

  doc.text(
    "ผู้อำนวยการ รพ.สต./หัวหน้าฝ่าย หรือผู้แทน",
    centerX,
    193,
    { align: "center" }
  );

  doc.text(
    "ปฏิบัติราชการแทน นายก อบจ.เชียงราย",
    centerX,
    201,
    { align: "center" }
  );

  doc.text("วันที่", 80, 211);
  dotField(95, 211, 50);

  doc.save(`แบบ3_${event.id}.pdf`);
};

  // --- แบบ 4 (รายงานรายเดือน) ---
  const printForm4 = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFont("THSarabunNew");
    doc.setFontSize(16);

    const centerX = 148;

    doc.setFontSize(22);
    doc.text(
      "รายงานการควบคุมการใช้รถส่วนกลาง (แบบ ๔)",
      centerX,
      15,
      { align: "center" }
    );

    doc.setFontSize(16);
    doc.text(
      `ประจำเดือน ${format(new Date(selectedMonth), "MMMM yyyy", {
        locale: th,
      })}`,
      centerX,
      25,
      { align: "center" }
    );

    const headers = [
      [
        "ลำดับ\nที่",
        "วันออกเดินทาง\nวันที่     เวลา",
        "ผู้ขอใช้รถ",
        "สถานที่ไป",
        "ระยะ กม./ไมล์\nเมื่อออกเดินทาง",
        "กลับถึงสำนักงาน\nวันที่     เวลา",
        "ระยะ กม./ไมล์\nเมื่อรถกลับ",
        "รวมระยะทาง\nกม./ไมล์",
        "พนักงานขับรถ\nหมายเหตุ",
      ],
    ];

    const body = events.map((e, i) => [
      i + 1,
      `${format(new Date(e.start_time), "dd/MM/yy")}\n${format(
        new Date(e.start_time),
        "HH:mm"
      )}`,
      e.participants?.[0]?.user.full_name || "-",
      e.title,
      e.start_mileage || "-",
      `${format(new Date(e.end_time), "dd/MM/yy")}\n${format(
        new Date(e.end_time),
        "HH:mm"
      )}`,
      e.end_mileage || "-",
      e.end_mileage && e.start_mileage
        ? (e.end_mileage - e.start_mileage).toLocaleString()
        : "-",
      "",
    ]);

    autoTable(doc, {
      startY: 30,
      head: headers,
      body,
      theme: "grid",
      styles: {
        font: "THSarabunNew",
        fontSize: 14,
        halign: "center",
        valign: "middle",
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
        6: { cellWidth: 25 },
        7: { cellWidth: 25 },
        8: { cellWidth: 25 },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.text(
      "ผู้บันทึก ......................................................",
      240,
      finalY,
      { align: "right" }
    );
    doc.text("( นายกิติ น้อยเรือน )", 230, finalY + 8, {
      align: "right",
    });
    doc.text("ตำแหน่ง ผอ.รพ.สต.ดอยงาม", 238, finalY + 16, {
      align: "right",
    });

    doc.save(`แบบ4_${selectedMonth}.pdf`);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 animate-fade-in">
      {/* Header Card */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-primary" /> ประวัติและรายงาน
          </h2>
          <p className="text-sm text-slate-500">
            จัดการพิมพ์ใบขออนุญาต (แบบ ๓) และสรุปรายงาน (แบบ ๔)
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="month"
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-primary outline-none"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <button
            onClick={printForm4}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> สรุปแบบ ๔
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 italic">
            กำลังโหลดข้อมูล...
          </div>
        ) : events.length > 0 ? (
          <div className="overflow-y-auto custom-scrollbar divide-y divide-slate-50">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  {/* Date Badge */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary border border-primary/20">
                    <span className="text-[10px] font-bold uppercase">
                      {format(new Date(event.start_time), "MMM", {
                        locale: th,
                      })}
                    </span>
                    <span className="text-xl font-black">
                      {format(new Date(event.start_time), "dd")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg leading-tight">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Car className="w-4 h-4" />{" "}
                        {event.vehicle?.plate_number}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />{" "}
                        {event.participants?.[0]?.user.full_name}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => printForm3(event)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
                >
                  <Printer className="w-4 h-4" /> พิมพ์แบบ ๓
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-20">
            <Calendar className="w-16 h-16 opacity-20 mb-4" />
            <p className="text-sm font-medium italic">
              ไม่พบข้อมูลกิจกรรมการใช้รถในเดือนนี้
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
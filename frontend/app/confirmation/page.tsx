"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { fmtDate } from "@/lib/api";

function ConfirmationContent() {
  const params     = useSearchParams();
  const bookingId  = params.get("id")    ?? "";
  const name       = params.get("name")  ?? "there";
  const eventTitle = params.get("event") ?? "Meeting";
  const startLocal = params.get("start");
  const endLocal   = params.get("end");
  const startDj    = startLocal ? dayjs(startLocal) : null;
  const endDj      = endLocal   ? dayjs(endLocal)   : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 text-center"
           style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>

        {/* Calendly-style green check */}
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Confirmed</h1>
        <p className="text-sm text-gray-500 mb-6">
          You are scheduled with{" "}
          <span className="font-medium text-gray-700">
            {process.env.NEXT_PUBLIC_DEV_DISPLAY_NAME ?? "the host"}
          </span>
          .
        </p>

        {/* Detail card */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-left mb-6">
          <div className="flex flex-col gap-3">
            <DetailRow
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label={eventTitle}
              value={`${startDj?.format("h:mm A")} – ${endDj?.format("h:mm A")}`}
            />
            {startDj && (
              <DetailRow
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                label={fmtDate(startDj)}
                value=""
              />
            )}
            <DetailRow
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
              label={name}
              value=""
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-5">
          A calendar invitation has been sent to your email address.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          {bookingId && (
            <a href={`/reschedule/${bookingId}`}
               className="w-full py-2.5 px-4 rounded-lg border border-gray-300
                          text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all text-center">
              Reschedule
            </a>
          )}
          <a href="/scheduling"
             className="w-full py-2.5 px-4 rounded-lg bg-[#006BFF] hover:bg-[#0056CC]
                        text-white text-sm font-semibold shadow-cal-btn transition-all text-center">
            Done
          </a>
        </div>

        <div className="mt-6 text-xs text-gray-400">
          Powered by <span className="text-[#006BFF] font-medium">Scheduly</span>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {value && <p className="text-xs text-gray-500 mt-0.5">{value}</p>}
      </div>
    </div>
  );
}
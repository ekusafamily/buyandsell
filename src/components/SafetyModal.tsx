import React from 'react';
import { X, ShieldCheck, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2 text-emerald-300 backdrop-blur-xs border border-white/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black tracking-tight">
            DeKUT Campus Safety & Trade Tips
          </h3>
          <p className="text-xs text-emerald-200 mt-1">
            How to trade safely with fellow comrades at Dedan Kimathi University
          </p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5">Golden Rule: Zero Advance Payments!</strong>
              Never send M-Pesa "commitment fees", "delivery deposits", or "booking money" before physically inspecting the product in person.
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Recommended Safe Meeting Zones at DeKUT</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                🏛️ <strong>Resource Center (RC)</strong> - Outside library steps or cafeteria
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                ☕ <strong>Student Center (SC)</strong> - Daytime open seating area
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                👮 <strong>Main Gate Security</strong> - Well-lit entrance with campus guards
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                🏢 <strong>Hostel Common Rooms</strong> - Batian or Nelion ground floor
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Buyer Safety Checklist
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Inspect Electronics:</strong> Plug in chargers, check battery life, test speakers and screen condition before paying.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Verify Gas Cylinders (Mekos):</strong> Check that the valve is intact, there is no smell of gas leak, and inspect the cylinder tare weight.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Confirm M-Pesa Name:</strong> Ensure the recipient name in the M-Pesa confirmation prompt matches the student seller you are meeting.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

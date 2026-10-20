'use client';

import React, { useState, useEffect } from 'react';
import { RsvpFormContent } from '@/lib/schema';
import { CheckCircle2, AlertCircle, Plus, Trash2, Lock } from 'lucide-react';

export interface RsvpFormModalProps {
  content: RsvpFormContent;
  invitationId?: string;
  guestToken?: string;
  initialGuestName?: string;
  initialSeats?: number;
  isOpen: boolean;
  onClose: () => void;
  styleMode?: 'modal' | 'bottom-sheet' | 'full-screen';
}

export interface RsvpFormData {
  name: string;
  email?: string;
  phone?: string;
  attendance: string;
  guestCount: number;
  dietary: string;
  songRequest: string;
}

export function RsvpFormModal({
  content,
  invitationId,
  guestToken,
  initialGuestName = '',
  initialSeats = 1,
  isOpen,
  onClose,
  styleMode = 'modal',
}: RsvpFormModalProps) {
  const [formData, setFormData] = useState<RsvpFormData>({
    name: initialGuestName,
    attendance: 'Joyfully Accept',
    guestCount: initialSeats,
    dietary: '',
    songRequest: '',
  });

  const [children, setChildren] = useState<Array<{ name: string; age: string }>>([]);
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if RSVP deadline has passed
  const isDeadlinePassed = content.deadline
    ? new Date(content.deadline).getTime() < Date.now()
    : false;

  useEffect(() => {
    if (initialGuestName) {
      setFormData((prev) => ({ ...prev, name: initialGuestName }));
    }
  }, [initialGuestName]);

  if (!isOpen) return null;

  const handleFieldChange = (name: keyof RsvpFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddChild = () => {
    setChildren((prev) => [...prev, { name: '', age: '' }]);
  };

  const handleRemoveChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChildChange = (index: number, field: 'name' | 'age', val: string) => {
    setChildren((prev) => {
      const copy = [...prev];
      const current = copy[index] || { name: '', age: '' };
      copy[index] = { ...current, [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDeadlinePassed) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        invitationId: invitationId || 'inv-sacred-garden',
        guestToken: guestToken || '',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        attending: formData.attendance === 'Joyfully Accept',
        guestCount: typeof formData.guestCount === 'number' ? formData.guestCount : parseInt(String(formData.guestCount), 10) || 1,
        dietary: formData.dietary,
        songRequest: formData.songRequest,
        childrenDetails: children,
        hp_website: honeypot, // Spam honeypot
      };

      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit RSVP');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error sending RSVP';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerClasses =
    styleMode === 'full-screen'
      ? 'fixed inset-0 z-50 bg-white/95 overflow-y-auto p-6 flex flex-col justify-center'
      : styleMode === 'bottom-sheet'
      ? 'fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto'
      : 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto';

  return (
    <div className={containerClasses} id="rsvp-modal-overlay">
      <div
        id="rsvp-modal-card"
        className="relative w-full max-w-lg bg-white rounded-3xl border border-[#a67d2b]/25 shadow-2xl p-6 sm:p-8 space-y-6"
      >
        <button
          onClick={onClose}
          id="btn-close-rsvp-modal"
          aria-label="Close modal"
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-800 text-lg font-bold"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <h2 className="font-serif text-2xl font-bold text-[#5a0f1b]">{content.headline}</h2>
          <p className="text-xs text-stone-500">{content.subheadline}</p>
        </div>

        {/* Deadline Notice */}
        {isDeadlinePassed ? (
          <div
            id="rsvp-deadline-locked-notice"
            className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3 text-xs"
          >
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="block font-semibold">RSVP Closed</strong>
              <span>The response deadline has passed. Please contact the couple directly.</span>
            </div>
          </div>
        ) : submitSuccess ? (
          <div
            id="rsvp-success-banner"
            className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col items-center text-center gap-2"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            <h3 className="font-bold text-sm">Response Received</h3>
            <p className="text-xs text-emerald-700">{content.successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div
                id="rsvp-error-banner"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Honeypot Spam Trap (Hidden) */}
            <input
              type="text"
              name="hp_website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Guest Name */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
              <input
                id="input-rsvp-name"
                type="text"
                required
                placeholder="e.g. Eleanor Vance"
                value={formData.name || ''}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:ring-1 focus:ring-[#a67d2b]"
              />
            </div>

            {/* Attendance Choice */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Will you be attending? *</label>
              <div className="grid grid-cols-2 gap-3">
                {['Joyfully Accept', 'Regretfully Decline'].map((choice) => (
                  <label
                    key={choice}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                      formData.attendance === choice
                        ? 'border-[#a67d2b] bg-[#a67d2b]/10 font-bold text-stone-900'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value={choice}
                      checked={formData.attendance === choice}
                      onChange={(e) => handleFieldChange('attendance', e.target.value)}
                      className="accent-[#a67d2b]"
                    />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional Fields: Only if Attending */}
            {formData.attendance === 'Joyfully Accept' && (
              <div id="rsvp-conditional-attending" className="space-y-4 pt-2 border-t border-stone-100">
                {/* Seats / Guest Count */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Total Guests Attending</label>
                  <input
                    id="input-rsvp-guest-count"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.guestCount || 1}
                    onChange={(e) => handleFieldChange('guestCount', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                </div>

                {/* Dietary Requirements */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Dietary Restrictions</label>
                  <input
                    id="input-rsvp-dietary"
                    type="text"
                    placeholder="e.g. Vegetarian, Gluten-free, Nut allergy"
                    value={formData.dietary || ''}
                    onChange={(e) => handleFieldChange('dietary', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                </div>

                {/* Song Request */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Song Request to Dance To</label>
                  <input
                    id="input-rsvp-song"
                    type="text"
                    placeholder="e.g. Ludovico Einaudi - Divenire"
                    value={formData.songRequest || ''}
                    onChange={(e) => handleFieldChange('songRequest', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                </div>

                {/* Repeater: Children Names & Ages */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-stone-700">Children Attending</label>
                    <button
                      type="button"
                      id="btn-add-child-repeater"
                      onClick={handleAddChild}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#a67d2b] hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Child</span>
                    </button>
                  </div>

                  {children.map((child, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        placeholder="Child's Name"
                        value={child.name}
                        onChange={(e) => handleChildChange(idx, 'name', e.target.value)}
                        className="flex-1 p-2 border border-stone-200 rounded-lg text-xs"
                      />
                      <input
                        placeholder="Age"
                        value={child.age}
                        onChange={(e) => handleChildChange(idx, 'age', e.target.value)}
                        className="w-20 p-2 border border-stone-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveChild(idx)}
                        className="p-1.5 text-stone-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="btn-submit-rsvp-form"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#5a0f1b] hover:bg-[#4a0d16] text-white font-semibold uppercase tracking-wider text-xs shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : content.submitLabel || 'Confirm Attendance'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

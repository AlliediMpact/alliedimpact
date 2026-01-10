'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, Mail, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InterviewSchedulerProps {
  candidateName: string;
  position: string;
  onSchedule: (details: InterviewDetails) => void;
  onCancel: () => void;
}

interface InterviewDetails {
  date: string;
  time: string;
  duration: number;
  platform: 'zoom' | 'teams' | 'google-meet';
  notes?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export function InterviewScheduler({ candidateName, position, onSchedule, onCancel }: InterviewSchedulerProps) {
  const [step, setStep] = useState<'date' | 'time' | 'details' | 'confirm'>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState(60);
  const [platform, setPlatform] = useState<'zoom' | 'teams' | 'google-meet'>('zoom');
  const [notes, setNotes] = useState('');

  // Generate next 14 days
  const generateDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
        dates.push(date);
      }
    }
    return dates;
  };

  const availableDates = generateDates();

  // Generate time slots
  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: false },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '13:00', available: true },
    { time: '13:30', available: false },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
  ];

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime) return;

    const details: InterviewDetails = {
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      duration,
      platform,
      notes
    };

    onSchedule(details);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Schedule Interview
          </CardTitle>
          <p className="text-sm text-gray-600">
            {candidateName} - {position}
          </p>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {(['date', 'time', 'details', 'confirm'] as const).map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`flex flex-col items-center ${idx > 0 ? 'ml-4' : ''}`}>
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                      step === s
                        ? 'bg-blue-600 text-white'
                        : ['date', 'time', 'details', 'confirm'].indexOf(step) > idx
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {['date', 'time', 'details', 'confirm'].indexOf(step) > idx ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 capitalize">{s}</span>
                </div>
                {idx < 3 && (
                  <div className={`h-1 w-16 mx-2 ${
                    ['date', 'time', 'details', 'confirm'].indexOf(step) > idx ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Select Date */}
          {step === 'date' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Select Interview Date</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableDates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedDate(date);
                      setStep('time');
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedDate?.toDateString() === date.toDateString()
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm text-gray-600">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="font-semibold text-gray-900">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Time */}
          {step === 'time' && selectedDate && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Select Time - {formatDate(selectedDate)}
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setStep('date')}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Change Date
                </Button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => {
                      if (slot.available) {
                        setSelectedTime(slot.time);
                        setStep('details');
                      }
                    }}
                    disabled={!slot.available}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      selectedTime === slot.time
                        ? 'border-blue-600 bg-blue-50'
                        : slot.available
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-sm font-semibold">{slot.time}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Interview Details */}
          {step === 'details' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Interview Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setStep('time')}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Change Time
                </Button>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-900">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="font-medium">{selectedDate && formatDate(selectedDate)} at {selectedTime}</span>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Duration
                </label>
                <div className="flex gap-2">
                  {[30, 45, 60, 90].map((min) => (
                    <button
                      key={min}
                      onClick={() => setDuration(min)}
                      className={`px-4 py-2 border-2 rounded-lg text-sm font-medium ${
                        duration === min
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Platform
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['zoom', 'teams', 'google-meet'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        platform === p
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Video className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm font-semibold capitalize">
                        {p === 'google-meet' ? 'Google Meet' : p}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any special instructions or topics to cover..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep('confirm')} className="flex items-center gap-2">
                  Review & Confirm
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && selectedDate && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Review Interview Details</h3>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(selectedDate)} at {selectedTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold text-gray-900">{duration} minutes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Video className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Platform</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {platform === 'google-meet' ? 'Google Meet' : platform}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Meeting link will be generated automatically
                      </p>
                    </div>
                  </div>

                  {notes && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="text-sm text-gray-900">{notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-3">
                  <Mail className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Email Confirmation</h4>
                    <p className="text-sm text-yellow-800">
                      Both you and {candidateName} will receive a calendar invitation with the meeting link.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConfirm} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4" />
                  Confirm & Send Invitation
                </Button>
                <Button variant="outline" onClick={() => setStep('details')}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button variant="ghost" onClick={onCancel} className="ml-auto">
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

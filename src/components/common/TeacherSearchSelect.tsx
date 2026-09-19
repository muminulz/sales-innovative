import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Check, UserCheck, X, ChevronDown, GraduationCap, Building2 } from 'lucide-react';
import { MENTORS } from '../../data/mentors';
import { Mentor } from '../../types';

interface TeacherSearchSelectProps {
  value: string;
  onChange: (mentorName: string, mentor?: Mentor) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export const TeacherSearchSelect: React.FC<TeacherSearchSelectProps> = ({
  value,
  onChange,
  label = 'Teacher / Faculty Mentor',
  required = false,
  placeholder = 'Search teacher by name, expertise, or company…',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedMentor = useMemo(() => {
    return MENTORS.find((m) => m.name.toLowerCase() === (value || '').toLowerCase());
  }, [value]);

  const filteredMentors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MENTORS;
    return MENTORS.filter((m) => {
      const matchName = m.name.toLowerCase().includes(q);
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchAffiliation = m.affiliation.toLowerCase().includes(q);
      return matchName || matchTitle || matchAffiliation;
    });
  }, [query]);

  const handleSelect = (mentor: Mentor) => {
    onChange(mentor.name, mentor);
    setQuery('');
    setIsOpen(false);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1 text-emerald-400">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{label}</span>
            {required && <span className="text-rose-400">*</span>}
          </span>
          <span className="text-[10px] text-zinc-500 font-normal">
            {MENTORS.length} Available Faculty
          </span>
        </label>
      )}

      {/* Selected Box or Search Input */}
      {selectedMentor && !isOpen ? (
        <div
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="w-full min-h-[42px] px-3 py-1.5 rounded-xl bg-black/50 border border-emerald-500/40 hover:border-emerald-400/60 cursor-pointer transition-all flex items-center justify-between gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {selectedMentor.photo ? (
              <img
                src={selectedMentor.photo}
                alt={selectedMentor.name}
                className="w-7 h-7 rounded-full object-cover border border-emerald-500/30 flex-none"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs flex-none">
                {selectedMentor.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 truncate">
                <span>{selectedMentor.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-normal">
                  Teacher
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1">
                <Building2 className="w-2.5 h-2.5 text-zinc-500 flex-none" />
                <span className="truncate">{selectedMentor.affiliation}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-none">
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition-colors"
              title="Change teacher"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={value ? `Selected: ${value} (type to search other)` : placeholder}
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-black/50 border border-white/10 focus:border-emerald-500/50 text-zinc-100 text-xs outline-none shadow-sm transition-colors placeholder:text-zinc-500"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 absolute right-3 pointer-events-none transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-xl bg-[#0d1012] border border-white/15 shadow-2xl p-1.5 space-y-1 divide-y divide-white/5 backdrop-blur-xl">
          <div className="px-2 py-1 flex items-center justify-between text-[10px] text-zinc-400 font-semibold">
            <span>Faculty Teachers & Mentors</span>
            <span>{filteredMentors.length} matching</span>
          </div>

          {filteredMentors.length === 0 ? (
            <div className="p-3 text-center">
              <div className="text-xs text-zinc-400">No teacher found for "{query}"</div>
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(query.trim());
                    setIsOpen(false);
                  }}
                  className="mt-2 px-3 py-1 text-[11px] rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/30"
                >
                  Use "{query.trim()}" as custom teacher name
                </button>
              )}
            </div>
          ) : (
            filteredMentors.map((mentor) => {
              const isSelected = value.toLowerCase() === mentor.name.toLowerCase();
              return (
                <div
                  key={mentor.name}
                  onClick={() => handleSelect(mentor)}
                  className={`p-2 rounded-lg cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200'
                      : 'hover:bg-white/5 text-zinc-200'
                  }`}
                >
                  {mentor.photo ? (
                    <img
                      src={mentor.photo}
                      alt={mentor.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/10 flex-none mt-0.5"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300 flex-none mt-0.5">
                      {mentor.name.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        <span className={isSelected ? 'text-emerald-300' : 'text-zinc-100'}>
                          {mentor.name}
                        </span>
                        {isSelected && <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono flex-none">
                        {mentor.affiliation}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                      {mentor.title}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-400 flex-none self-center" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

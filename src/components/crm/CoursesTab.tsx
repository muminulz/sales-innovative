import React, { useState } from 'react';
import { Search, ExternalLink, BookOpen } from 'lucide-react';
import { COURSES } from '../../data/courses';

interface CoursesTabProps {
  onSelectCourseForLead?: (courseName: string, mode: string) => void;
}

export const CoursesTab: React.FC<CoursesTabProps> = ({
  onSelectCourseForLead,
}) => {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  const filtered = COURSES.filter((c) => {
    const q = search.toLowerCase();
    const matchesQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.mode.toLowerCase().includes(q);
    const matchesMode = !modeFilter || c.mode.toLowerCase() === modeFilter.toLowerCase();
    return matchesQuery && matchesMode;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
            Course Catalog & Pricing
          </h2>
          <p className="text-xs text-zinc-400">
            Search all 34 Innovative Skills courses with official pricing and URLs.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#0e1114] border border-white/10">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Computer Vision, Backend AI, Python, ML, Thesis…"
            className="w-full h-8 pl-9 pr-3 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/40"
          />
        </div>

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="h-8 px-2.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-200 outline-none focus:border-emerald-500/40"
        >
          <option value="">All modes ({COURSES.length})</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
          <option value="Recorded">Recorded</option>
        </select>

        <span className="text-xs text-zinc-500 ml-auto">
          {filtered.length} courses matching
        </span>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((course) => (
          <div
            key={course.name}
            className="p-3.5 rounded-xl border border-white/10 bg-[#0e1114] hover:border-white/20 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-zinc-900 border border-white/10 text-zinc-400">
                  {course.mode || 'Online'}
                </span>
                <div className="text-right">
                  {course.price ? (
                    <div className="text-sm font-bold text-emerald-400">
                      ৳{course.price.toLocaleString()}
                      {course.old && (
                        <span className="text-[10px] text-zinc-500 line-through ml-1.5 font-normal">
                          ৳{course.old.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : course.old ? (
                    <div className="text-sm font-bold text-zinc-300">
                      ৳{course.old.toLocaleString()}
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500">Free / TBA</span>
                  )}
                </div>
              </div>

              <h4 className="text-xs font-bold text-zinc-100 line-clamp-2 mb-3">
                {course.name}
              </h4>
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
              {onSelectCourseForLead && (
                <button
                  type="button"
                  onClick={() => onSelectCourseForLead(course.name, course.mode)}
                  className="flex-1 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Attach to Lead</span>
                </button>
              )}
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-[10px] font-semibold flex items-center gap-1"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

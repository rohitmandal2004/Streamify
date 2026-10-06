import React from 'react';
import { motion } from 'framer-motion';

// Enhanced shimmer skeleton with gradient animation
const Shimmer = ({ className = '', style = {} }) => (
  <motion.div
    className={`relative overflow-hidden rounded-lg bg-white/[0.04] ${className}`}
    style={style}
  >
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      }}
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    />
  </motion.div>
);

// === Page Skeletons ===

// Dashboard / Home skeleton
export const DashboardSkeleton = () => (
  <div className="flex flex-1 flex-col w-full h-full p-6 sm:p-10">
    {/* Hero area */}
    <div className="flex flex-col xl:flex-row items-center gap-12 w-full max-w-7xl mx-auto pt-10">
      <div className="w-full xl:w-1/2 flex justify-center">
        <Shimmer className="w-full max-w-md aspect-square rounded-3xl" />
      </div>
      <div className="w-full xl:w-1/2 space-y-6">
        <Shimmer className="h-5 w-40 rounded-full" />
        <Shimmer className="h-12 w-3/4" />
        <Shimmer className="h-12 w-full" />
        <Shimmer className="h-5 w-2/3" />
        <Shimmer className="h-5 w-1/2" />
      </div>
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-12">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 sm:p-8 space-y-5">
          <Shimmer className="w-14 h-14 rounded-2xl" />
          <Shimmer className="h-7 w-40" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-2/3" />
          <div className="pt-4 space-y-3">
            <Shimmer className="h-12 w-full rounded-xl" />
            <Shimmer className="h-12 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>

    {/* Review section */}
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-8 space-y-4">
        <Shimmer className="h-7 w-48" />
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => <Shimmer key={i} className="w-8 h-8 rounded" />)}
        </div>
        <Shimmer className="h-12 w-full rounded-xl" />
        <Shimmer className="h-24 w-full rounded-xl" />
        <Shimmer className="h-12 w-40 rounded-xl" />
      </div>
    </div>
  </div>
);

// History page skeleton
export const HistorySkeleton = () => (
  <div className="flex flex-1 flex-col w-full p-6 sm:p-10 pb-32 md:pb-10">
    {/* Header */}
    <div className="flex items-center gap-4 mb-12 mt-4">
      <Shimmer className="w-16 h-16 rounded-2xl" />
      <div className="space-y-2">
        <Shimmer className="h-8 w-64" />
        <Shimmer className="h-4 w-48" />
      </div>
    </div>

    {/* Cards grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-white/[0.02] min-h-[280px] flex flex-col justify-end">
          <Shimmer className="absolute inset-0 rounded-none" />
          <div className="relative z-10 p-6 space-y-4">
            <Shimmer className="h-4 w-20 rounded-full" />
            <div className="pt-8 space-y-3">
              <Shimmer className="h-7 w-48" />
              <Shimmer className="h-4 w-36" />
              <Shimmer className="h-4 w-28" />
            </div>
            <Shimmer className="h-12 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Calendar page skeleton
export const CalendarSkeleton = () => (
  <div className="flex flex-1 flex-col w-full p-8 pb-32 md:pb-8">
    <Shimmer className="h-10 w-64 mb-8" />

    {/* Calendar container */}
    <div className="rounded-[32px] border border-white/[0.06] bg-white/[0.02] overflow-hidden mb-8">
      <div className="p-6 sm:p-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Calendar grid */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Shimmer className="h-6 w-32" />
              <div className="flex gap-2">
                <Shimmer className="w-8 h-8 rounded-lg" />
                <Shimmer className="w-8 h-8 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <Shimmer key={`header-${i}`} className="h-8 rounded" />
              ))}
              {[...Array(35)].map((_, i) => (
                <Shimmer key={`day-${i}`} className="h-10 rounded-lg" />
              ))}
            </div>
          </div>
          {/* Time slots */}
          <div className="w-full md:w-48 space-y-2">
            <Shimmer className="h-6 w-24 mb-3" />
            {[...Array(8)].map((_, i) => (
              <Shimmer key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="border-t border-white/[0.06] p-6 flex flex-col md:flex-row items-center gap-4">
        <Shimmer className="h-4 w-64" />
        <div className="flex gap-3 ml-auto">
          <Shimmer className="h-12 w-48 rounded-xl" />
          <Shimmer className="h-12 w-36 rounded-xl" />
        </div>
      </div>
    </div>

    {/* Meeting cards */}
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-white/[0.02] min-h-[280px] flex flex-col justify-end">
          <Shimmer className="absolute inset-0 rounded-none" />
          <div className="relative z-10 p-6 space-y-4">
            <div className="flex justify-between">
              <Shimmer className="h-6 w-20 rounded-full" />
              <div className="flex gap-2">
                <Shimmer className="w-8 h-8 rounded-xl" />
                <Shimmer className="w-8 h-8 rounded-xl" />
              </div>
            </div>
            <div className="pt-8 space-y-3">
              <Shimmer className="h-7 w-48" />
              <Shimmer className="h-4 w-36" />
            </div>
            <div className="flex gap-2">
              <Shimmer className="h-12 flex-1 rounded-xl" />
              <Shimmer className="h-12 w-14 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Settings page skeleton
export const SettingsSkeleton = () => (
  <div className="flex flex-1 flex-col w-full p-8">
    <Shimmer className="h-10 w-48 mb-8" />
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8 max-w-2xl space-y-6">
      <Shimmer className="h-4 w-72 mb-6" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between items-center pb-4 border-b border-white/[0.04]">
          <div className="space-y-2">
            <Shimmer className="h-5 w-32" />
            <Shimmer className="h-3 w-56" />
          </div>
          <Shimmer className="w-12 h-6 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

// Profile page skeleton
export const ProfileSkeleton = () => (
  <div className="flex flex-1 flex-col w-full max-w-4xl mx-auto p-4 md:p-8 pt-20">
    {/* Header */}
    <div className="mb-8 space-y-2">
      <div className="flex items-center gap-3">
        <Shimmer className="w-8 h-8 rounded" />
        <Shimmer className="h-8 w-40" />
      </div>
      <Shimmer className="h-4 w-64 ml-11" />
    </div>

    {/* Card */}
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="p-8 flex flex-col items-center border-b border-white/[0.04]">
        <Shimmer className="w-32 h-32 rounded-full" />
        <div className="mt-4 space-y-2 flex flex-col items-center">
          <Shimmer className="h-7 w-40" />
          <Shimmer className="h-4 w-28" />
        </div>
      </div>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-white/[0.04] flex justify-end">
          <Shimmer className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

// Sidebar skeleton (for the sidebar area while loading)
export const SidebarSkeleton = () => (
  <div className="h-full w-[68px] hidden md:flex flex-col px-4 py-4 bg-black/40 backdrop-blur-xl border-r border-white/[0.06]">
    <Shimmer className="w-8 h-8 rounded-lg mb-8" />
    <div className="space-y-3 flex-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Shimmer key={i} className="w-8 h-8 rounded-xl" />
      ))}
    </div>
    <Shimmer className="w-8 h-8 rounded-full" />
  </div>
);

// Full page skeleton (sidebar + content)
export const FullPageSkeleton = ({ variant = 'dashboard' }) => {
  const skeletons = {
    dashboard: DashboardSkeleton,
    history: HistorySkeleton,
    calendar: CalendarSkeleton,
    settings: SettingsSkeleton,
    profile: ProfileSkeleton,
  };

  const ContentSkeleton = skeletons[variant] || skeletons.dashboard;

  return (
    <div className="flex flex-col md:flex-row bg-[#0B0D17] w-full flex-1 overflow-hidden h-screen text-white">
      <SidebarSkeleton />
      <div className="flex flex-1 overflow-y-auto w-full">
        <ContentSkeleton />
      </div>
    </div>
  );
};

export default Shimmer;

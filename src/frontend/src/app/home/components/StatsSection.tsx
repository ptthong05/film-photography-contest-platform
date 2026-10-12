import React from 'react';
import { Users, Calendar, Image as ImageIcon, Trophy, TrendingUp } from 'lucide-react';

export function StatsSection() {
  const stats = [
    {
      id: 'users',
      label: 'Người dùng',
      value: '1,248',
      change: '+ 12%',
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'contests',
      label: 'Cuộc thi đã tổ chức',
      value: '12',
      change: '+ 2',
      icon: Calendar,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'photos',
      label: 'Tác phẩm dự thi',
      value: '3,642',
      change: '+ 18%',
      icon: ImageIcon,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'awards',
      label: 'Giải thưởng',
      value: '28',
      change: '+ 4',
      icon: Trophy,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-16 lg:-mt-20 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xl shadow-slate-900/8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group overflow-hidden"
            >
              {/* Subtle decorative chart wave in background */}
              <div className="absolute right-0 bottom-0 w-28 h-14 opacity-15 pointer-events-none">
                <svg viewBox="0 0 100 40" className="w-full h-full fill-none stroke-emerald-600 stroke-[3]">
                  <path d="M0 35 Q 25 32, 50 20 T 100 8" />
                </svg>
              </div>

              {/* Icon & Label */}
              <div className="flex items-center gap-4 relative z-10">
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center ${stat.bgColor} ${stat.iconColor} transition-transform group-hover:scale-105 shrink-0`}
                >
                  <Icon className="w-6.5 h-6.5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-500">
                    {stat.label}
                  </div>
                </div>
              </div>

              {/* Growth Badge */}
              <div
                className={`relative z-10 flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full border ${stat.badgeColor}`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

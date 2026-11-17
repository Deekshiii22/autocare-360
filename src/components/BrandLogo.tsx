import React from 'react';

interface BrandLogoProps {
  inverted?: boolean;
  compact?: boolean;
}

export function BrandLogo({ inverted = false, compact = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0 select-none">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          inverted
            ? 'bg-white/10 text-white border border-white/15'
            : 'bg-[#101828] text-white dark:bg-[#2563EB]'
        }`}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3L4.5 6.2V11.8C4.5 16.5 7.7 20.8 12 22C16.3 20.8 19.5 16.5 19.5 11.8V6.2L12 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12.2" r="3.2" stroke="#60A5FA" strokeWidth="1.8" />
          <path
            d="M12 9V10.4M12 14V15.4M8.8 12.2H10.2M13.8 12.2H15.2"
            stroke="#60A5FA"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {!compact && (
        <span
          className={`font-display text-lg font-bold tracking-tight ${
            inverted ? 'text-white' : 'text-[#101828] dark:text-white'
          }`}
        >
          AutoCare <span className="text-[#2563EB] dark:text-blue-400">360</span>
        </span>
      )}
    </div>
  );
}

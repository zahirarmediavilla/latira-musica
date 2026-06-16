// Inline SVG icons (no icon dependency). 24x24, color via `currentColor`.
// The filled icons (Search, Menu, Sliders, X, Back, ArrowRight) come from the
// design set in /public/Icons; the rest are simple stroke icons.
type P = { className?: string };
const base = "h-6 w-6";

export function SearchIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.75 11C17.75 7.27208 14.7279 4.25 11 4.25C7.27208 4.25 4.25 7.27208 4.25 11C4.25 14.7279 7.27208 17.75 11 17.75C12.8182 17.75 14.467 17.0294 15.6807 15.8604C15.7072 15.8278 15.7363 15.7969 15.7666 15.7666C15.7969 15.7363 15.8278 15.7072 15.8604 15.6807C17.0294 14.467 17.75 12.8182 17.75 11ZM20.25 11C20.25 13.1036 19.546 15.0417 18.3633 16.5957L21.8838 20.1162C22.3719 20.6044 22.3719 21.3956 21.8838 21.8838C21.3956 22.3719 20.6044 22.3719 20.1162 21.8838L16.5957 18.3633C15.0417 19.546 13.1036 20.25 11 20.25C5.89137 20.25 1.75 16.1086 1.75 11C1.75 5.89137 5.89137 1.75 11 1.75C16.1086 1.75 20.25 5.89137 20.25 11Z" />
    </svg>
  );
}

export function FilterIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

export function BackIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.1162 4.11624C11.6044 3.62808 12.3957 3.62808 12.8838 4.11624C13.372 4.60439 13.372 5.39566 12.8838 5.88382L8.01761 10.75H19C19.6904 10.75 20.25 11.3097 20.25 12C20.25 12.6904 19.6904 13.25 19 13.25H8.01761L12.8838 18.1162C13.372 18.6044 13.372 19.3957 12.8838 19.8838C12.3957 20.372 11.6044 20.372 11.1162 19.8838L4.11624 12.8838C3.62808 12.3957 3.62808 11.6044 4.11624 11.1162L11.1162 4.11624Z" />
    </svg>
  );
}

export function CloseIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.1161 5.11624C17.6043 4.62808 18.3955 4.62808 18.8837 5.11624C19.3719 5.60439 19.3719 6.39566 18.8837 6.88382L13.7675 12L18.8837 17.1162C19.3719 17.6044 19.3719 18.3957 18.8837 18.8838C18.3955 19.372 17.6043 19.372 17.1161 18.8838L11.9999 13.7676L6.88369 18.8838C6.39554 19.372 5.60427 19.372 5.11612 18.8838C4.62796 18.3957 4.62796 17.6044 5.11612 17.1162L10.2323 12L5.11612 6.88382C4.62796 6.39566 4.62796 5.60439 5.11612 5.11624C5.60427 4.62808 6.39554 4.62808 6.88369 5.11624L11.9999 10.2324L17.1161 5.11624Z" />
    </svg>
  );
}

export function PinIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ExternalIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

export function CheckIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function MenuIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16.75C21.6904 16.75 22.25 17.3096 22.25 18C22.25 18.6904 21.6904 19.25 21 19.25H3C2.30964 19.25 1.75 18.6904 1.75 18C1.75 17.3096 2.30964 16.75 3 16.75H21ZM21 10.75C21.6904 10.75 22.25 11.3096 22.25 12C22.25 12.6904 21.6904 13.25 21 13.25H3C2.30964 13.25 1.75 12.6904 1.75 12C1.75 11.3096 2.30964 10.75 3 10.75H21ZM21 4.75C21.6904 4.75 22.25 5.30964 22.25 6C22.25 6.69036 21.6904 7.25 21 7.25H3C2.30964 7.25 1.75 6.69036 1.75 6C1.75 5.30964 2.30964 4.75 3 4.75H21Z" />
    </svg>
  );
}

// Vertical sliders / tune icon used for the filter action.
export function SlidersIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.75 21V15.25H1C0.309644 15.25 -0.25 14.6904 -0.25 14C-0.25 13.3096 0.309644 12.75 1 12.75H7C7.69036 12.75 8.25 13.3096 8.25 14C8.25 14.6904 7.69036 15.25 7 15.25H5.25V21C5.25 21.6904 4.69036 22.25 4 22.25C3.30964 22.25 2.75 21.6904 2.75 21ZM10.75 21V12C10.75 11.3096 11.3096 10.75 12 10.75C12.6904 10.75 13.25 11.3096 13.25 12V21C13.25 21.6904 12.6904 22.25 12 22.25C11.3096 22.25 10.75 21.6904 10.75 21ZM18.75 21V17.25H17C16.3096 17.25 15.75 16.6904 15.75 16C15.75 15.3096 16.3096 14.75 17 14.75H23C23.6904 14.75 24.25 15.3096 24.25 16C24.25 16.6904 23.6904 17.25 23 17.25H21.25V21C21.25 21.6904 20.6904 22.25 20 22.25C19.3096 22.25 18.75 21.6904 18.75 21ZM18.75 12V3C18.75 2.30964 19.3096 1.75 20 1.75C20.6904 1.75 21.25 2.30964 21.25 3V12C21.25 12.6904 20.6904 13.25 20 13.25C19.3096 13.25 18.75 12.6904 18.75 12ZM2.75 10V3C2.75 2.30964 3.30964 1.75 4 1.75C4.69036 1.75 5.25 2.30964 5.25 3V10C5.25 10.6904 4.69036 11.25 4 11.25C3.30964 11.25 2.75 10.6904 2.75 10ZM10.75 3C10.75 2.30964 11.3096 1.75 12 1.75C12.6904 1.75 13.25 2.30964 13.25 3V6.75H15C15.6904 6.75 16.25 7.30964 16.25 8C16.25 8.69036 15.6904 9.25 15 9.25H9C8.30964 9.25 7.75 8.69036 7.75 8C7.75 7.30964 8.30964 6.75 9 6.75H10.75V3Z" />
    </svg>
  );
}

export function ArrowRightIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.1162 4.11624C11.6044 3.62808 12.3956 3.62808 12.8838 4.11624L19.8838 11.1162C20.3719 11.6044 20.3719 12.3957 19.8838 12.8838L12.8838 19.8838C12.3956 20.372 11.6044 20.372 11.1162 19.8838C10.6281 19.3957 10.6281 18.6044 11.1162 18.1162L15.9824 13.25H5C4.30964 13.25 3.75 12.6904 3.75 12C3.75 11.3097 4.30964 10.75 5 10.75H15.9824L11.1162 5.88382C10.6281 5.39566 10.6281 4.60439 11.1162 4.11624Z" />
    </svg>
  );
}

export function ClearCircleIcon({ className = base }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

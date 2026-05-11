import * as React from "react";

type Props = {
  name:
    | "logo"
    | "dashboard"
    | "units"
    | "attendance"
    | "requests"
    | "search"
    | "bell"
    | "chevronRight"
    | "chevronLeft"
    | "download"
    | "upload"
    | "check"
    | "x"
    | "play"
    | "filter"
    | "export"
    | "user"
    | "logout";
  className?: string;
};

const common = {
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

export function Icon({ name, className }: Props) {
  const cls = className ?? "h-5 w-5";

  switch (name) {
    case "logo":
      return (
        <svg
          {...common}
          viewBox="0 0 24 24"
          className={cls}
          aria-hidden="true"
        >
          <rect x="2.5" y="2.5" width="19" height="19" rx="6" fill="#F97316" />
          <path
            d="M16.6 8.8c-1.1-1.4-2.8-2.2-4.7-2.2-2.9 0-5.2 1.9-5.2 4.4 0 1.7 1 3 2.6 3.7 1.4.6 3.3.7 4.7.3 1-.3 1.8-.8 2.3-1.5l-2-.9c-.7.7-2.4.9-3.6.4-.7-.3-1.1-.8-1.1-1.4 0-1 1-1.8 2.4-1.8 1.1 0 2 .4 2.6 1.1l2-.9Z"
            fill="white"
            opacity="0.95"
          />
        </svg>
      );
    case "dashboard":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M4 13.5V7.4C4 6.1 5.1 5 6.4 5h3.2C10.9 5 12 6.1 12 7.4v6.1c0 1.3-1.1 2.4-2.4 2.4H6.4C5.1 15.9 4 14.8 4 13.5Zm8 3.1V10.5c0-1.3 1.1-2.4 2.4-2.4h3.2c1.3 0 2.4 1.1 2.4 2.4v6.1c0 1.3-1.1 2.4-2.4 2.4h-3.2c-1.3 0-2.4-1.1-2.4-2.4Z"
            fill="currentColor"
          />
        </svg>
      );
    case "units":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M7 3.8h10c1.2 0 2.2 1 2.2 2.2v12.4c0 1.2-1 2.2-2.2 2.2H7c-1.2 0-2.2-1-2.2-2.2V6c0-1.2 1-2.2 2.2-2.2Zm2.1 4.4h5.8a.9.9 0 1 0 0-1.8H9.1a.9.9 0 1 0 0 1.8Zm0 3.6h5.8a.9.9 0 1 0 0-1.8H9.1a.9.9 0 1 0 0 1.8Z"
            fill="currentColor"
          />
        </svg>
      );
    case "attendance":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M5 19.2V6.5C5 5.1 6.1 4 7.5 4h9C17.9 4 19 5.1 19 6.5v12.7c0 .4-.3.8-.8.8H5.8c-.4 0-.8-.4-.8-.8Zm4.4-7.7a1 1 0 0 1 1.4 0l1 1 2.8-2.8a1 1 0 1 1 1.4 1.4l-3.5 3.5a1 1 0 0 1-1.4 0L9.4 13a1 1 0 0 1 0-1.4Z"
            fill="currentColor"
          />
        </svg>
      );
    case "requests":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M6.3 3.8h8.2c.5 0 1 .2 1.4.6l2.3 2.3c.4.4.6.9.6 1.4v12.3c0 1.2-1 2.2-2.2 2.2H6.3c-1.2 0-2.2-1-2.2-2.2V6c0-1.2 1-2.2 2.2-2.2Zm2 7.1h7.4a.9.9 0 0 0 0-1.8H8.3a.9.9 0 0 0 0 1.8Zm0 3.6h5.7a.9.9 0 0 0 0-1.8H8.3a.9.9 0 0 0 0 1.8Z"
            fill="currentColor"
          />
        </svg>
      );
    case "search":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M10.5 18.2a7.7 7.7 0 1 1 0-15.4 7.7 7.7 0 0 1 0 15.4Zm6.3-1.4 3.2 3.2a1 1 0 0 1-1.4 1.4l-3.2-3.2a1 1 0 0 1 1.4-1.4Z"
            fill="currentColor"
          />
        </svg>
      );
    case "bell":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M12 22a2.3 2.3 0 0 0 2.2-1.7H9.8A2.3 2.3 0 0 0 12 22Zm7-5.2H5c-.7 0-1.1-.8-.6-1.4 1.1-1.4 1.8-2.4 1.8-5 0-3.3 2.3-6 5.8-6s5.8 2.7 5.8 6c0 2.6.7 3.6 1.8 5 .5.6.1 1.4-.6 1.4Z"
            fill="currentColor"
          />
        </svg>
      );
    case "chevronRight":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M9 5.5a1 1 0 0 1 1.7-.7l6.4 6.4a1 1 0 0 1 0 1.4l-6.4 6.4A1 1 0 0 1 9 18.3V5.5Z"
            fill="currentColor"
          />
        </svg>
      );
    case "chevronLeft":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M15 18.5a1 1 0 0 1-1.7.7l-6.4-6.4a1 1 0 0 1 0-1.4l6.4-6.4A1 1 0 0 1 15 5.7v12.8Z"
            fill="currentColor"
          />
        </svg>
      );
    case "download":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M12 3.8a1 1 0 0 1 1 1v8.1l2.2-2.2a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4l2.2 2.2V4.8a1 1 0 0 1 1-1Zm-7 15a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"
            fill="currentColor"
          />
        </svg>
      );
    case "upload":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M12 20.2a1 1 0 0 1-1-1V11l-2.2 2.2a1 1 0 0 1-1.4-1.4l4-4a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1-1.4 1.4L13 11v8.2a1 1 0 0 1-1 1Zm-7-15a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"
            fill="currentColor"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M9.3 16.9 4.9 12.5a1 1 0 1 1 1.4-1.4l3 3 8.4-8.4a1 1 0 0 1 1.4 1.4l-9.8 9.8a1 1 0 0 1-1.4 0Z"
            fill="currentColor"
          />
        </svg>
      );
    case "x":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M7.1 5.7a1 1 0 0 1 1.4 0L12 9.2l3.5-3.5a1 1 0 1 1 1.4 1.4L13.4 10.6l3.5 3.5a1 1 0 0 1-1.4 1.4L12 12l-3.5 3.5a1 1 0 0 1-1.4-1.4l3.5-3.5-3.5-3.5a1 1 0 0 1 0-1.4Z"
            fill="currentColor"
          />
        </svg>
      );
    case "play":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M9 7.4c0-1.1 1.2-1.8 2.1-1.2l7 4.6c.8.5.8 1.8 0 2.3l-7 4.6c-.9.6-2.1-.1-2.1-1.2V7.4Z"
            fill="currentColor"
          />
        </svg>
      );
    case "filter":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M4.2 6.5c0-.6.5-1.1 1.1-1.1h13.4c.6 0 1.1.5 1.1 1.1 0 .2-.1.5-.2.7l-5.2 6.3v3.9c0 .4-.2.7-.6.9l-2.7 1.4c-.7.3-1.5-.2-1.5-1v-5.2L4.4 7.2a1 1 0 0 1-.2-.7Z"
            fill="currentColor"
          />
        </svg>
      );
    case "export":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M12 3.8a1 1 0 0 1 1 1v6l1.7-1.7a1 1 0 1 1 1.4 1.4l-3.4 3.4a1 1 0 0 1-1.4 0L8.9 10.5a1 1 0 1 1 1.4-1.4L12 10.8v-6a1 1 0 0 1 1-1ZM6.2 16.2a1 1 0 0 1 1 1v1.3h9.6v-1.3a1 1 0 1 1 2 0v2.1c0 .7-.6 1.3-1.3 1.3H6.5c-.7 0-1.3-.6-1.3-1.3v-2.1a1 1 0 0 1 1-1Z"
            fill="currentColor"
          />
        </svg>
      );
    case "user":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M12 12.2a4.3 4.3 0 1 0 0-8.6 4.3 4.3 0 0 0 0 8.6Zm-7 8.2c0-4 3.1-6.7 7-6.7s7 2.7 7 6.7c0 .6-.5 1.1-1.1 1.1H6.1c-.6 0-1.1-.5-1.1-1.1Z"
            fill="currentColor"
          />
        </svg>
      );
    case "logout":
      return (
        <svg {...common} viewBox="0 0 24 24" className={cls}>
          <path
            d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}


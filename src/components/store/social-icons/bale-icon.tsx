import type { SocialSvgProps } from "./icon-props";

export function BaleIcon(props: SocialSvgProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <path
        d="M50 2C23.49 2 2 23.49 2 50v42.3a5.7 5.7 0 0 0 9.05 4.61l12.62-9.17A47.78 47.78 0 0 0 50 98c26.51 0 48-21.49 48-48S76.51 2 50 2Z"
        fill="#00B894"
      />
      <path
        d="m27.5 49.5 15.2 15.2 30-30"
        stroke="#fff"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

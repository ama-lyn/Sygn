import type { AttendancePoint } from "@/lib/types";

function clampPct(v: number) {
  return Math.max(0, Math.min(100, v));
}

export function WeeklyAttendanceChart({
  data,
}: {
  data: AttendancePoint[];
}) {
  const w = 640;
  const h = 220;
  const padX = 28;
  const padTop = 18;
  const padBottom = 28;
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBottom;

  const pts = data.map((d, idx) => {
    const x = padX + (innerW * idx) / Math.max(1, data.length - 1);
    const y = padTop + innerH * (1 - clampPct(d.presentPct) / 100);
    return { x, y, label: d.day };
  });

  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const area =
    `${line} ` +
    `L ${pts[pts.length - 1]?.x.toFixed(1)} ${(padTop + innerH).toFixed(1)} ` +
    `L ${pts[0]?.x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-[220px] w-full"
        role="img"
        aria-label="Weekly attendance chart"
      >
        <defs>
          <linearGradient id="sygnArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB923C" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* grid */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padTop + innerH * (1 - v / 100);
          return (
            <g key={v}>
              <line
                x1={padX}
                x2={w - padX}
                y1={y}
                y2={y}
                stroke="#E4E4E7"
                strokeWidth="1"
              />
              <text
                x={10}
                y={y + 4}
                fontSize="11"
                fill="#71717A"
                fontFamily="ui-sans-serif, system-ui"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* area + line */}
        <path d={area} fill="url(#sygnArea)" />
        <path d={line} fill="none" stroke="#F97316" strokeWidth="3" />

        {/* points */}
        {pts.map((p) => (
          <circle
            key={p.label}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="white"
            stroke="#F97316"
            strokeWidth="2"
          />
        ))}

        {/* x labels */}
        {pts.map((p) => (
          <text
            key={`${p.label}-x`}
            x={p.x}
            y={h - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#71717A"
            fontFamily="ui-sans-serif, system-ui"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}


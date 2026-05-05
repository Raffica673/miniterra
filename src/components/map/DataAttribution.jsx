export default function DataAttribution() {
  return (
    <text
      textAnchor="end"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 6,
        fill: 'var(--text-dim)',
        opacity: 0.4,
      }}
    >
      <tspan x={0} dy={0}>Sources: ESA Sentinel-2 · NASA POWER · ECMWF ERA5</tspan>
      <tspan x={0} dy={8}>USGS SRTM · WorldClim 2.1 · JRC Global Surface Water</tspan>
    </text>
  );
}

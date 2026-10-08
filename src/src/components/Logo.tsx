export default function Logo({ height = 44 }: { height?: number }) {
  return (
    <span className="logo-box">
      <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Juan Reyes · Desarrollador Web" height={height} style={{ height, width: 'auto', display: 'block' }} />
    </span>
  )
}

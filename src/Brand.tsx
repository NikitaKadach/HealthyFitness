export default function Brand({ large = false }: { large?: boolean }) {
  return (
    <div className={'brand' + (large ? ' brand-lg' : '')}>
      <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
        <path d="M2 20 L9.5 6 L13 12.5 L15.5 9 L22 20 Z" fill="currentColor" />
      </svg>
      <span>Healthy Fitness</span>
    </div>
  )
}

export default function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="mb-8">
      <div className="flex items-end justify-between gap-6">
        <h2 className="font-display text-3xl sm:text-4xl text-charcoal">{title}</h2>
        {action}
      </div>
      {subtitle && <p className="mt-2 text-sm text-charcoal/60 max-w-md">{subtitle}</p>}
      <div className="hairline mt-5 w-24" />
    </div>
  )
}

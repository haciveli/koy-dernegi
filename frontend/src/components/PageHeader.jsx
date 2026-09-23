export default function PageHeader({ icon: Icon, title, subtitle }) {
  return (
    <section className="relative overflow-hidden bg-koy-900 text-white">
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-koy-500/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-vurgu-500/15 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 text-center animate-fade-up">
        {Icon && (
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center mx-auto mb-5 shadow-soft">
            <Icon size={26} className="text-koy-200" />
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-4 text-koy-100/80 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">{subtitle}</p>
        )}
      </div>
    </section>
  )
}

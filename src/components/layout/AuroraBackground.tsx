export default function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 0%, rgba(52, 211, 153, 0.12), transparent 50%),
            radial-gradient(ellipse 70% 50% at 80% 20%, rgba(34, 211, 238, 0.10), transparent 50%),
            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(52, 211, 153, 0.08), transparent 50%),
            radial-gradient(ellipse 50% 40% at 90% 80%, rgba(34, 211, 238, 0.06), transparent 50%)
          `,
          backgroundSize: '200% 200%',
          animation: 'aurora 18s ease infinite',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(52, 211, 153, 0.03), transparent 60%)',
        }}
      />
    </div>
  );
}

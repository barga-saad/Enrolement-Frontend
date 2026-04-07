export const GeometricDecor = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Primary Bold Shapes */}
      <div className="bcp-geometric-shape triangle-up w-72 h-72 bg-bcp-orange top-[-5%] left-[-10%] rotate-[15deg] animate-float opacity-[0.08]" />
      <div className="bcp-geometric-shape triangle-down w-[500px] h-[500px] bg-bcp-brown bottom-[-15%] right-[-10%] -rotate-[12deg] animate-float opacity-[0.06]" style={{ animationDelay: '2s' }} />
      <div className="bcp-geometric-shape diamond w-64 h-64 bg-bcp-orange top-[35%] right-[-5%] rotate-[45deg] opacity-[0.04] animate-pulse-soft" />
      
      {/* Secondary Accent Shapes */}
      <div className="bcp-geometric-shape triangle-up w-40 h-40 bg-bcp-brown top-[20%] right-[15%] rotate-[180deg] opacity-[0.03]" />
      <div className="bcp-geometric-shape triangle-down w-32 h-32 bg-bcp-orange bottom-[25%] left-[20%] rotate-[45deg] opacity-[0.05] animate-float" style={{ animationDelay: '4s' }} />
      
      {/* Transparent Layering (Image 1 Style) */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] border border-bcp-orange/10 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-[20%] right-[30%] w-[400px] h-[400px] border border-bcp-brown/10 rounded-full blur-3xl opacity-20" />

      {/* Floating Micro-elements */}
      <div className="absolute top-[15%] right-[25%] w-4 h-4 bg-bcp-orange/20 rounded-full animate-ping" />
      <div className="absolute bottom-[25%] left-[35%] w-3 h-3 bg-bcp-brown/20 rounded-full animate-pulse" />
      <div className="absolute top-[40%] left-[45%] w-2 h-2 bg-bcp-orange/30 rounded-full" />
    </div>
  );
};

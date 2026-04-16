export function PropertySkyline() {
  return (
    <div className="relative mb-6">
      <div className="flex items-center justify-center mb-3">
        {/* Left side - Residential buildings */}
        <div className="flex items-end gap-0.5">
          <div className="w-3 h-4 bg-gradient-to-t from-blue-200 to-blue-300 rounded-sm opacity-60"></div>
          <div className="w-2 h-5 bg-gradient-to-t from-blue-300 to-blue-400 rounded-sm opacity-80"></div>
          <div className="w-3 h-3 bg-gradient-to-t from-blue-200 to-blue-300 rounded-sm opacity-60"></div>
        </div>

        {/* Center - Main building */}
        <div className="mx-3 flex items-end gap-0.5">
          <div className="w-4 h-6 bg-gradient-to-t from-primary/60 to-primary rounded-sm opacity-90"></div>
          <div className="w-3 h-8 bg-gradient-to-t from-primary/40 to-primary/80 rounded-sm opacity-80"></div>
          <div className="w-3 h-5 bg-gradient-to-t from-primary/60 to-primary rounded-sm opacity-90"></div>
        </div>

        {/* Right side - Commercial buildings */}
        <div className="flex items-end gap-0.5">
          <div className="w-3 h-4 bg-gradient-to-t from-blue-200 to-blue-300 rounded-sm opacity-60"></div>
          <div className="w-2 h-6 bg-gradient-to-t from-blue-300 to-blue-400 rounded-sm opacity-80"></div>
          <div className="w-3 h-4 bg-gradient-to-t from-blue-200 to-blue-300 rounded-sm opacity-60"></div>
        </div>
      </div>
    </div>
  );
}


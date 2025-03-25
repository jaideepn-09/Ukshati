export default function BillHeading() {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-8 px-6 w-full mx-auto rounded-xl shadow-2xl border border-white/10 relative overflow-hidden">
      {/* Subtle animated background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-32 h-32 bg-purple-500/30 rounded-full -top-16 -left-16 animate-pulse-slow"></div>
        <div className="absolute w-32 h-32 bg-blue-500/30 rounded-full -bottom-16 -right-16 animate-pulse-slow"></div>
      </div>

      {/* Main heading content */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Bill Generation
          </h1>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        </div>

        {/* Subtle subtitle */}
        <p className="text-center text-sm text-gray-400 font-medium">
          Ukshati Technologies Private Limited
        </p>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-purple-500/50"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-500/50"></div>
    </div>
  );
}
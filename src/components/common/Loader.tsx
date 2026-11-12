import { GeometricDecor } from './GeometricDecor';
import logo from '../../../image.png';

export const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg font-sans" role="status" aria-live="polite">

      {/* Background Decor to match the overall premium feel */}
      <GeometricDecor />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with a soft halo */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-[2rem] bg-bcp-orange/15 blur-2xl scale-125 animate-pulse" />
          <div className="relative w-24 h-24 bg-white dark:bg-white/5 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center shadow-bcp-medium border border-gray-200/70 dark:border-white/10">
            <img src={logo} alt="BCP Logo" className="h-12 w-12 object-contain" />
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-4 text-center">
          <h2 className="text-[12px] font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-[0.35em]">
            Syncing Access
          </h2>

          <div className="w-48 h-1 bg-gray-200 dark:bg-dark-bg-soft rounded-full overflow-hidden mx-auto">
            <div className="bg-gradient-to-r from-transparent via-bcp-orange to-bcp-brown h-full w-full rounded-full animate-progress" />
          </div>

          <p className="text-[10px] font-semibold text-gray-400 dark:text-white/30 uppercase tracking-widest">
            BCP Central Security Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

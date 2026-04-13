import { GeometricDecor } from './GeometricDecor';
import logo from '../../../image.png';

export const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50 dark:bg-dark-bg font-['Inter']">
      
      {/* Background Decor to match the overall premium feel */}
      <GeometricDecor />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Rings around the Logo */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-center">
             <div className="w-32 h-32 border-4 border-bcp-orange/20 rounded-[3rem] animate-pulse-soft" />
             <div className="absolute w-40 h-40 border border-bcp-brown/10 rounded-[3.5rem] animate-ping opacity-20" />
        </div>

        {/* Sophisticated Floating Logo */}
        <div className="w-24 h-24 bg-white dark:bg-white/5 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/50 dark:border-white/10 animate-float mb-8">
          <img src={logo} alt="BCP Logo" className="h-12 w-12 object-contain" />
        </div>

        {/* High-end loading text with tracking */}
        <div className="space-y-4 text-center">
          <h2 className="text-[12px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.4em]">
            Syncing Access
          </h2>
          
          <div className="w-48 h-1 bg-gray-200 dark:bg-dark-bg-soft rounded-full overflow-hidden mx-auto shadow-inner">
            <div className="bg-gradient-to-r from-bcp-orange to-bcp-brown h-full w-full animate-[progress_1.5s_infinite_ease-in-out]" />
          </div>
          
          <p className="text-[10px] font-bold text-gray-500/50 dark:text-white/20 uppercase tracking-widest">
            BCP Central Security Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

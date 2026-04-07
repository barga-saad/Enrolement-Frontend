import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, ShieldCheckIcon } from 'lucide-react';
import { GeometricDecor } from '../common/GeometricDecor';
import towerImg from '../../../image copy.png';
import logo from '../../../image.png';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { user, changePassword, isLoading, error: storeError } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please provide your new security credentials.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Minimum 8-character security threshold required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Credentials mismatch. Verify and retry.');
      return;
    }

    try {
      await changePassword(user!.username, newPassword);
      setSuccess(true);
      // Wait for 1.5s for the success animation then go dashboard
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Verification update failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative font-['Inter']">
      
      {/* 🚀 EPIC BACKGROUND: TOWER WITH MODERN FILTERS */}
      <div className="absolute inset-0 z-0">
        <img 
          src={towerImg} 
          alt="BCP Tower" 
          className="w-full h-full object-cover brightness-[0.45] saturate-[1.2] contrast-[1.1] scale-105 transition-transform duration-[20s] animate-pulse-soft"
        />
        <div className="absolute inset-0 bcp-tower-overlay" />
      </div>

      {/* 💎 GEOMETRIC DECOR */}
      <GeometricDecor />

      <div className="relative z-10 w-full max-w-[600px] p-6">
        <div className="bg-white/95 dark:bg-[#121212]/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 transition-all duration-700 animate-slideUp">
          
          {/* HEADER SECTION */}
          <div className="bg-gradient-to-br from-bcp-brown to-bcp-brown-dark p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-2xl animate-float">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <img src={logo} alt="BCP Logo" className="h-10 mx-auto mb-6 object-contain brightness-0 invert" />
            <h1 className="text-3xl font-black text-white mb-2 tracking-tighter">Initialize Access</h1>
            <p className="text-white/60 text-sm font-medium px-4">
              Authorized access detected. You are required to update your security credentials to proceed to the secure hub.
            </p>
          </div>

          {/* FORM / SUCCESS BODY */}
          <div className="p-10 lg:p-14">
            {success ? (
              <div className="text-center py-8 animate-fadeIn">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100 dark:border-green-500/20 shadow-xl shadow-green-500/10 animate-bounce">
                  <ShieldCheckIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Security Level Verified</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Password modified successfully. Redirecting to your secure dashboard…</p>
                <div className="w-full bg-gray-100 dark:bg-dark-bg-soft h-1.5 rounded-full overflow-hidden mt-8 max-w-[200px] mx-auto">
                  <div className="bg-green-500 h-full w-full animate-[progress_1.8s_ease-in-out]" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Visual Feedback on Error */}
                {(error || storeError) && (
                  <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-xl p-4 text-sm font-black flex items-center animate-shake">
                    {error || storeError}
                  </div>
                )}

                {/* NEW PASSWORD PORTAL */}
                <div className="space-y-3 group">
                  <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest pl-1 group-focus-within:text-bcp-orange transition-colors">
                    New Security Key
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-bcp-orange" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full pl-14 pr-14 py-5 bg-gray-50/50 dark:bg-white/[0.03] border-2 border-transparent dark:border-white/5 rounded-3xl outline-none focus:bg-white dark:focus:bg-transparent focus:border-bcp-orange/20 focus:ring-4 focus:ring-bcp-orange/10 transition-all duration-300 font-bold text-gray-700 dark:text-white"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bcp-orange transition-colors"
                    >
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* CONFIRMATION PORTAL */}
                <div className="space-y-3 group">
                  <label className="text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest pl-1 group-focus-within:text-bcp-orange transition-colors">
                    Confirm Identifier
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-bcp-orange" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full pl-14 pr-14 py-5 bg-gray-50/50 dark:bg-white/[0.03] border-2 border-transparent dark:border-white/5 rounded-3xl outline-none focus:bg-white dark:focus:bg-transparent focus:border-bcp-orange/20 focus:ring-4 focus:ring-bcp-orange/10 transition-all duration-300 font-bold text-gray-700 dark:text-white"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bcp-orange transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group bg-gradient-to-r from-bcp-orange to-bcp-orange-dark text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-orange-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-500 disabled:opacity-50 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <div className="relative z-10 flex items-center justify-center space-x-4">
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="uppercase tracking-[0.2em] text-sm">Synchronizing Access...</span>
                      </>
                    ) : (
                      <>
                        <span className="uppercase tracking-[0.2em] text-sm">Update Security Key</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </form>
            )}
          </div>

          <footer className="p-8 text-center bg-gray-50/50 dark:bg-white/[0.02] text-[10px] uppercase tracking-widest font-black text-gray-400 dark:text-white/20">
            BCP Central Security Protocol • Session Highly Synchronized
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;

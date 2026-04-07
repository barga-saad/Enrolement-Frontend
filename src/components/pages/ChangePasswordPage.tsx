import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheckIcon, Building2 } from 'lucide-react';
import { GeometricDecor } from '../common/GeometricDecor';
import towerImg from '../../../image copy.png';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { user, changePassword, isLoading, error: storeError, isAuthenticated, requiresPasswordChange } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If not authenticated or no user, redirect to login
  // If authenticated and password change not required, redirect home
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (!requiresPasswordChange && !success) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, requiresPasswordChange, success, navigate]);

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
      if (!user) throw new Error('User context lost. Please login again.');
      await changePassword(user.username, newPassword);
      setSuccess(true);
      
      // Navigate to dashboard almost instantly
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 300);
    } catch (err: any) {
      setError(err.message || 'Verification update failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative font-['Inter'] transition-colors duration-500">
      
      {/* 🚀 EPIC BACKGROUND: TOWER WITH MODERN FILTERS */}
      <div className="absolute inset-0 z-0">
        <img 
          src={towerImg} 
          alt="BCP Tower" 
          className="w-full h-full object-cover brightness-[0.8] saturate-[1.4] contrast-[1.1] scale-105"
        />
        <div className="absolute inset-0 bcp-tower-overlay" />
      </div>

      {/* 💎 GEOMETRIC DECOR */}
      <GeometricDecor />

      <div className="w-full max-w-[500px] flex rounded-[2.5rem] shadow-[0_45px_90px_-20px_rgba(0,0,0,0.7)] overflow-hidden relative z-10 mx-6 bg-transparent backdrop-blur-md border border-white/10 transition-all duration-700 animate-slideUp">
        
        {/* 🛂 SINGLE CENTERED PORTAL: PASSWORD FORM */}
        <div className="flex-1 p-8 md:p-12 bg-white/5 dark:bg-black/60 backdrop-blur-3xl flex flex-col justify-center items-center relative overflow-hidden text-white">
          
          <div className="w-full max-w-[340px] relative z-10">
            {success ? (
              <div className="text-center animate-fadeIn py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30 shadow-2xl shadow-green-500/20 animate-bounce">
                  <ShieldCheckIcon className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Verified</h3>
                <p className="text-white/60 text-sm font-medium">Security Key Updated. Accessing Hub…</p>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-bcp-orange/20 rounded-xl flex items-center justify-center mb-4 border border-bcp-orange/20">
                     <Lock className="w-6 h-6 text-bcp-orange animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                    Security <span className="animate-shine inline-block">Reset</span>
                  </h1>
                  <p className="text-white/40 font-black uppercase text-[8px] tracking-[0.4em] mt-2">Update Credentials to Proceed</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {(error || storeError) && (
                    <div className="bg-red-500/20 border-l-4 border-red-500 text-white rounded-lg p-3 text-xs font-bold flex items-center animate-shake backdrop-blur-md">
                      {error || storeError}
                    </div>
                  )}

                  <div className="space-y-1 group">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 transition-colors group-focus-within:text-bcp-orange" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Security Key"
                        className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-bcp-orange/50 transition-all duration-300 font-semibold text-sm text-white placeholder-white/30"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-bcp-orange transition-colors"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 group">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 transition-colors group-focus-within:text-bcp-orange" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Identifier"
                        className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 focus:border-bcp-orange/50 transition-all duration-300 font-semibold text-sm text-white placeholder-white/30"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-bcp-orange transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full group bg-gradient-to-r from-bcp-orange to-bcp-orange-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 overflow-hidden relative mt-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="relative z-10 flex items-center justify-center space-x-3">
                      {isLoading ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="uppercase tracking-[0.15em] text-xs font-bold">Synchronize</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </form>
              </>
            )}

            <div className="mt-8">
              <footer className="text-[8px] uppercase tracking-[0.3em] font-black text-white/20 text-center">
                Banque Centrale Populaire
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;

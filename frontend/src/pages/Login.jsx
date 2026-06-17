import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, Loader2, UserCog, User, UserPlus, Phone, CheckCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useLanguage } from '../contexts/LanguageContext';
import { login, register, googleLogin, clearError } from '../redux/slices/authSlice';
import { getSecurityQuestions, forgotPassword } from '../api/authApi';

const securityQuestionOptions = [
  "What is your mother's maiden name?",
  'What was the name of your first pet?',
  'What city were you born in?',
  'What is your favorite book?',
  'What is the name of your best friend?',
  'What was your childhood nickname?',
  'What is your favorite food?',
  'What is your dream destination?',
];

const testAccounts = [
  { label: 'Admin', email: 'admin@electrofix.com', password: 'admin123', role: 'admin', icon: UserCog },
  { label: 'Customer', email: 'john@example.com', password: 'customer123', role: 'customer', icon: User },
];

const inputStyle = {
  width: '100%', height: '45px', background: 'transparent', border: 'none', outline: 'none',
  fontSize: '1em', color: '#fff', padding: '0 35px 0 5px', lineHeight: '45px',
};
const labelStyle = (up) => ({
  position: 'absolute', top: up ? '-12px' : '50%', left: '5px',
  transform: up ? 'translateY(0)' : 'translateY(-50%)',
  fontSize: up ? '0.8em' : '1em', color: up ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
  pointerEvents: 'none', transition: 'all 0.25s ease',
  background: up ? 'rgba(0,0,0,0.3)' : 'transparent',
  padding: up ? '0 6px' : '0', borderRadius: '4px',
});
const iconStyle = { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.6)', display: 'flex' };
const fieldWrap = { position: 'relative', marginBottom: '20px', borderBottom: '2px solid rgba(255,255,255,0.5)' };
const btnStyle = (disabled) => ({
  width: '100%', height: '45px', background: '#fff', border: 'none', outline: 'none',
  borderRadius: '40px', cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '1em', color: '#000', fontWeight: 500, display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: disabled ? 0.7 : 1,
});
const glassCard = {
  position: 'relative', width: '100%', maxWidth: '420px',
  background: 'rgba(0,0,0,0.35)', border: '2px solid rgba(255, 255, 255, .5)',
  borderRadius: '20px', backdropFilter: 'blur(15px)', padding: '30px 20px', zIndex: 10,
  maxHeight: '90vh', overflowY: 'auto',
};

const glassCardClass = 'login-card';
const titleClass = 'login-title';
const subtitleClass = 'login-subtitle';
const testGridClass = 'login-test-grid';

const Login = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [focused, setFocused] = useState({});
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', phoneNumber: '', confirmPassword: '',
  });
  const [sq, setSq] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);
  // Forgot password flow
  const [forgotStep, setForgotStep] = useState('email'); // email | question | reset
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotQuestion, setForgotQuestion] = useState('');
  const [forgotQuestionIndex, setForgotQuestionIndex] = useState(0);
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(''); // '' | 'changePassword'
  const [answerError, setAnswerError] = useState(false);

  useEffect(() => {
    if (userInfo) {
      navigate(userInfo.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digits }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setLocalError('');
  };
  const handleFocus = (e) => setFocused((prev) => ({ ...prev, [e.target.name]: true }));
  const handleBlur = (e) => setFocused((prev) => ({ ...prev, [e.target.name]: false }));
  const labelUp = (field) => focused[field] || formData[field];

  const fillTestAccount = (acc) => {
    setFormData((prev) => ({ ...prev, email: acc.email, password: acc.password }));
  };

  const switchMode = (m) => {
    setMode(m);
    setFocused({});
    setLocalError('');
    setForgotSuccess('');
    setForgotStep('email');
    setForgotEmail('');
    setForgotQuestion('');
    setForgotAnswer('');
    setForgotNewPassword('');
    setRecoveryMode('');
    setAnswerError(false);
    dispatch(clearError());
  };

  const handleSQChange = (idx, field, value) => {
    const updated = [...sq];
    updated[idx][field] = value;
    setSq(updated);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      if (formData.email && formData.password) {
        dispatch(login({ email: formData.email, password: formData.password }));
      }
    } else if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      if (formData.phoneNumber && formData.phoneNumber.length !== 10) {
        setLocalError('Phone number must be exactly 10 digits');
        return;
      }
      if (sq.some((s) => !s.question || !s.answer)) {
        setLocalError('Please answer all 3 security questions');
        return;
      }
      const registerData = { ...formData };
      delete registerData.confirmPassword;
      dispatch(register({ ...registerData, securityQuestions: sq }));
    }
  };

  const handleForgotEmail = async () => {
    if (!forgotEmail) { setLocalError('Please enter your email'); return; }
    setForgotLoading(true);
    setLocalError('');
    setAnswerError(false);
    setRecoveryMode('');
    try {
      const data = await getSecurityQuestions(forgotEmail);
      setForgotQuestion(data.questions[data.askIndex].question);
      setForgotQuestionIndex(data.askIndex);
      setForgotStep('question');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Email not found');
      setRecoveryMode('showOptions');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotAnswer = async () => {
    if (!forgotAnswer) { setLocalError('Please enter your answer'); return; }
    setLocalError('');
    setForgotStep('reset');
  };

  const handleForgotReset = async () => {
    if (forgotNewPassword.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    setForgotLoading(true);
    setLocalError('');
    try {
      await forgotPassword({
        email: forgotEmail,
        questionIndex: forgotQuestionIndex,
        answer: forgotAnswer,
        newPassword: forgotNewPassword,
      });
      setForgotSuccess('Password updated successfully! You can now login.');
      setForgotStep('email');
      setMode('login');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to reset password');
      setAnswerError(true);
    } finally {
      setForgotLoading(false);
    }
  };

  const displayError = localError || error;

  // ─── Shared input builder ───
  const renderField = (name, label, icon, extraStyles = {}, type = 'text') => (
    <div style={{ ...fieldWrap, ...extraStyles }}>
      <input
        type={type} name={name} value={formData[name] || ''}
        onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} required
        style={type === 'password' && name === 'password'
          ? { ...inputStyle, padding: '0 60px 0 5px' }
          : inputStyle}
      />
      <label style={labelStyle(labelUp(name))}>{label}</label>
      {name === 'password' ? (
        <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button type="button" onClick={() => setShowPassword((prev) => !prev)}
            style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex' }}><Lock size={18} /></span>
        </div>
      ) : (
        <span style={iconStyle}>{icon}</span>
      )}
    </div>
  );

  // ─── Security Question field for register ───
  const renderSQField = (idx) => (
    <div key={idx} style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
      <div style={{ fontSize: '0.75em', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', fontWeight: 600 }}>Security Question #{idx + 1}</div>
      <select
        value={sq[idx].question}
        onChange={(e) => handleSQChange(idx, 'question', e.target.value)}
        required
        style={{
          width: '100%', height: '38px', background: '#1e293b', color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
          padding: '0 10px', fontSize: '0.8em', outline: 'none', marginBottom: '8px',
        }}
      >
        <option value="">Select a question</option>
        {securityQuestionOptions.map((q) => (
          <option key={q} value={q}>{q}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Your answer"
        value={sq[idx].answer}
        onChange={(e) => handleSQChange(idx, 'answer', e.target.value)}
        required
        style={{
          width: '100%', height: '38px', background: 'rgba(0,0,0,0.3)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
          padding: '0 10px', fontSize: '0.8em', outline: 'none',
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <style>{`
        @keyframes hueRotate {
          100% { filter: hue-rotate(360deg); }
        }
        .animate-hue { animation: hueRotate 5s linear infinite; }
        select option { background: #fff; color: #1e293b; }
        @media (prefers-color-scheme: dark) {
          select option { background: #1e293b; color: #f1f5f9; }
        }
        @media (max-width: 480px) {
          .login-card { padding: 20px 12px !important; }
          .login-title { font-size: 1.6em !important; }
          .login-test-grid { grid-template-columns: 1fr !important; }
          .login-subtitle { font-size: 0.75em !important; }
        }
        @media (min-width: 481px) and (max-width: 768px) {
          .login-card { padding: 25px 16px !important; }
        }
        @media (min-width: 1024px) {
          .login-card { max-width: 440px !important; }
        }
        @media (max-height: 700px) {
          .login-card { max-height: 96vh !important; padding-top: 15px !important; padding-bottom: 15px !important; }
          .login-title { font-size: 1.5em !important; margin-bottom: 2px !important; }
        }
      `}</style>
      <div className="absolute inset-0 animate-hue">
        <img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1920" alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
      </div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(15,23,42,0.75) 50%, rgba(0,0,0,0.7) 100%)' }}></div>

      <div style={glassCard} className={glassCardClass}>
        {/* ─── HEADER ─── */}
        {mode !== 'forgot' && (
          <>
            <h2 className={titleClass} style={{ fontSize: '2em', color: '#fff', textAlign: 'center', marginBottom: '4px', fontWeight: 600 }}>
              {mode === 'login' ? 'Login' : 'Register'}
            </h2>
            <p className={subtitleClass} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.85em', marginBottom: '18px' }}>
              {mode === 'login' ? t('login.welcome') : 'Create your account to get started.'}
            </p>
          </>
        )}

        {/* ─── FORGOT PASSWORD HEADER ─── */}
        {mode === 'forgot' && (
          <>
            <h2 className={titleClass} style={{ fontSize: '1.6em', color: '#fff', textAlign: 'center', marginBottom: '4px', fontWeight: 600 }}>
              {forgotStep === 'email' ? 'Forgot Password' : forgotStep === 'question' ? 'Security Question' : 'Reset Password'}
            </h2>
            <p className={subtitleClass} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.85em', marginBottom: '18px' }}>
              {forgotStep === 'email' ? 'Enter your email to verify your identity' :
               forgotStep === 'question' ? 'Answer the security question to proceed' :
               'Create a new password for your account'}
            </p>
          </>
        )}

        {/* ─── ERROR / SUCCESS ─── */}
        {displayError && (
          <div style={{ background: 'rgba(255, 0, 0, 0.15)', border: '1px solid rgba(255,0,0,0.3)', color: '#ff8a8a', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85em', marginBottom: '15px', textAlign: 'center' }}>
            {displayError}
          </div>
        )}
        {forgotSuccess && (
          <div style={{ background: 'rgba(0, 200, 0, 0.15)', border: '1px solid rgba(0,200,0,0.3)', color: '#8aff8a', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85em', marginBottom: '15px', textAlign: 'center' }}>
            {forgotSuccess}
          </div>
        )}

        {/* ─── LOGIN ─── */}
        {mode === 'login' && (
          <>
            {/* Test accounts */}
            <div style={{ marginBottom: '18px' }}>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.75em', marginBottom: '8px' }}>{t('login.testAccounts')}</p>
              <div className={testGridClass} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {testAccounts.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button key={acc.label} type="button" onClick={() => fillTestAccount(acc)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: acc.role === 'admin' ? 'rgba(99,102,241,0.3)' : 'rgba(20,184,166,0.3)', flexShrink: 0 }}>
                        <Icon size={14} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.75em', fontWeight: 700 }}>{t(`login.${acc.label.toLowerCase()}`)}</div>
                        <div style={{ fontSize: '0.6em', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{acc.email}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <GoogleLogin
                onSuccess={credentialResponse => {
                  dispatch(googleLogin(credentialResponse.credential));
                }}
                onError={() => setLocalError('Google sign-in failed')}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="100%"
                prompt="select_account"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8em' }}>or continue with email</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
            </div>

            <form onSubmit={submitHandler}>
              {renderField('email', 'Email', <Mail size={18} />)}
              {renderField('password', 'Password', null, {}, showPassword ? 'text' : 'password')}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85em', color: '#fff', margin: '-5px 0 15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: '#fff' }} />
                  Remember Me
                </label>
                <button type="button" onClick={() => switchMode('forgot')}
                  style={{ color: '#fff', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85em' }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >Forgot Password?</button>
              </div>

              <button type="submit" disabled={loading} style={btnStyle(loading)}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? t('login.signingIn') : t('login.signIn')}
              </button>

              <div style={{ fontSize: '0.85em', color: '#fff', textAlign: 'center', margin: '16px 0 0' }}>
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('register')}
                  style={{ color: '#fff', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9em' }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >Register</button>
              </div>
            </form>
          </>
        )}

        {/* ─── REGISTER ─── */}
        {mode === 'register' && (
          <form onSubmit={submitHandler}>
            {renderField('fullName', 'Full Name', <User size={18} />)}
            {renderField('email', 'Email', <Mail size={18} />)}
            {renderField('phoneNumber', 'Phone Number', <Phone size={18} />, {}, 'tel')}
            {renderField('password', 'Password', null, {}, showPassword ? 'text' : 'password')}
            {renderField('confirmPassword', 'Confirm Password', <CheckCircle size={18} />, {}, 'password')}

            {/* Security Questions */}
            <div style={{ marginTop: '20px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <HelpCircle size={16} color="rgba(255,255,255,0.6)" />
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85em', fontWeight: 600 }}>Security Questions</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7em', marginBottom: '10px' }}>
                Set 3 security questions for password recovery
              </p>
              {[0, 1, 2].map((idx) => renderSQField(idx))}
            </div>

            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div style={{ fontSize: '0.85em', color: '#fff', textAlign: 'center', margin: '16px 0 0' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => switchMode('login')}
                style={{ color: '#fff', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9em' }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >Login</button>
            </div>
          </form>
        )}

        {/* ─── FORGOT PASSWORD ─── */}
        {mode === 'forgot' && (
          <>
            {forgotStep === 'email' && (
              <div>
                {recoveryMode === 'changePassword' && (
                  <div style={{ background: 'rgba(255, 200, 0, 0.12)', border: '1px solid rgba(255,200,0,0.3)', color: '#ffd700', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8em', marginBottom: '15px', textAlign: 'center' }}>
                    Enter your registered email address to change your password
                  </div>
                )}
                <div style={{ position: 'relative', marginBottom: '20px', borderBottom: '2px solid rgba(255,255,255,0.5)' }}>
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    onFocus={() => setFocused((p) => ({ ...p, forgotEmail: true }))}
                    onBlur={() => setFocused((p) => ({ ...p, forgotEmail: false }))}
                    required style={inputStyle} />
                  <label style={labelStyle(focused.forgotEmail || forgotEmail)}>Email</label>
                  <span style={iconStyle}><Mail size={18} /></span>
                </div>
                <button type="button" onClick={handleForgotEmail} disabled={forgotLoading} style={btnStyle(forgotLoading)}>
                  {forgotLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {forgotLoading ? 'Verifying...' : 'Verify Email'}
                </button>
                {recoveryMode === 'showOptions' && (
                  <div style={{ marginTop: '14px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8em', marginBottom: '8px' }}>Didn't find your account?</div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button type="button" onClick={() => setRecoveryMode('changePassword')}
                        style={{ color: '#ffd700', background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8em', padding: '6px 18px' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,200,0,0.2)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,200,0,0.1)' }}
                      >Change Password</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {forgotStep === 'question' && (
              <div>
                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75em', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Security Question</div>
                  <div style={{ color: '#fff', fontSize: '0.95em', fontWeight: 500 }}>{forgotQuestion}</div>
                </div>
                <div style={{ position: 'relative', marginBottom: '20px', borderBottom: '2px solid rgba(255,255,255,0.5)' }}>
                  <input type="text" value={forgotAnswer} onChange={(e) => { setForgotAnswer(e.target.value); setAnswerError(false); }}
                    onFocus={() => setFocused((p) => ({ ...p, forgotAnswer: true }))}
                    onBlur={() => setFocused((p) => ({ ...p, forgotAnswer: false }))}
                    required style={inputStyle} />
                  <label style={labelStyle(focused.forgotAnswer || forgotAnswer)}>Your Answer</label>
                  <span style={iconStyle}><HelpCircle size={18} /></span>
                </div>
                <button type="button" onClick={handleForgotAnswer} style={btnStyle(false)}>Continue</button>
                {answerError && (
                  <div style={{ marginTop: '14px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8em', marginBottom: '8px' }}>Wrong answer?</div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => { setForgotStep('question'); setForgotAnswer(''); setLocalError(''); setAnswerError(false); }}
                        style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8em', padding: '6px 18px' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                      >Try Again</button>
                      <button type="button" onClick={() => { setForgotStep('email'); setForgotEmail(forgotEmail); setAnswerError(false); setLocalError(''); setRecoveryMode('changePassword'); }}
                        style={{ color: '#ffd700', background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8em', padding: '6px 18px' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,200,0,0.2)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,200,0,0.1)' }}
                      >Change Password</button>
                    </div>
                  </div>
                )}
                <div style={{ fontSize: '0.8em', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: answerError ? '8px' : '10px' }}>
                  <button type="button" onClick={() => { setForgotStep('email'); setAnswerError(false); }}
                    style={{ color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85em' }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >&larr; Use different email</button>
                </div>
              </div>
            )}

            {forgotStep === 'reset' && (
              <div>
                <div style={{ padding: '14px', background: 'rgba(0,200,0,0.1)', borderRadius: '12px', border: '1px solid rgba(0,200,0,0.3)', marginBottom: '20px' }}>
                  <div style={{ color: '#8aff8a', fontSize: '0.85em', textAlign: 'center' }}>Answer verified! Now set a new password.</div>
                </div>
                <div style={{ position: 'relative', marginBottom: '20px', borderBottom: '2px solid rgba(255,255,255,0.5)' }}>
                  <input type="password" value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)}
                    onFocus={() => setFocused((p) => ({ ...p, forgotNewPassword: true }))}
                    onBlur={() => setFocused((p) => ({ ...p, forgotNewPassword: false }))}
                    required style={{ ...inputStyle, padding: '0 35px 0 5px' }} />
                  <label style={labelStyle(focused.forgotNewPassword || forgotNewPassword)}>New Password</label>
                  <span style={iconStyle}><Lock size={18} /></span>
                </div>
                <button type="button" onClick={handleForgotReset} disabled={forgotLoading} style={btnStyle(forgotLoading)}>
                  {forgotLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}

            <div style={{ fontSize: '0.85em', color: '#fff', textAlign: 'center', margin: '16px 0 0' }}>
              <button type="button" onClick={() => switchMode('login')}
                style={{ color: '#fff', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9em' }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >Back to Login</button>
            </div>
          </>
        )}
      </div>

      {/* Back to home */}
      <Link to="/" style={{
        position: 'absolute', top: '20px', left: '20px', zIndex: 20,
        display: 'flex', alignItems: 'center', gap: '6px',
        color: 'rgba(255,255,255,0.7)', fontSize: '0.85em', fontWeight: 500,
        textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '8px 16px',
        borderRadius: '20px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.2s',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Home</span>
      </Link>
    </div>
  );
};

export default Login;

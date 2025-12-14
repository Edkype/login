import React, { useState, useRef, useEffect } from 'react';
import {
  FluentProvider,
  Card,
  Text,
  Input,
  Button,
  Link,
  Title3,
  Image,
  makeStyles,
  shorthands,
  mergeClasses
} from '@fluentui/react-components';
import { ArrowLeft24Regular, ErrorCircle20Regular } from '@fluentui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { enderBkTheme } from './theme';

// --- STYLES ---
const useStyles = makeStyles({
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url(/background.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
    color: 'white',
    fontFamily: 'Segoe UI, sans-serif'
  },
  card: {
    width: '440px',
    maxWidth: '90%',
    backgroundColor: enderBkTheme.colorNeutralBackground1,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${enderBkTheme.colorNeutralStroke1}`,
    ...shorthands.padding('44px'),
    ...shorthands.borderRadius('12px'),
    position: 'relative',
    overflow: 'hidden'
  },

  // --- HEADER & LOGO (ALWAYS CENTERED) ---
  header: {
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: '16px',
    position: 'relative'
  },
  logoImage: { 
    width: 'auto', 
    height: 'auto', 
    maxHeight: '32px', 
    maxWidth: '100%', 
    objectFit: 'contain' 
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10
  },

  // --- TEXT CONTAINERS (ALWAYS CENTERED) ---
  textCenterContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '24px',
    width: '100%'
  },

  // --- INPUTS ---
  inputContainer: { marginBottom: '16px', width: '100%' },
  
  // FIX: Force padding inside the input text area
  inputField: { 
      width: '100%',
      '& input': { 
          paddingLeft: '12px !important', 
          paddingRight: '12px !important' 
      }
  },
  
  inputError: {
    ...shorthands.borderColor('#E60000 !important'),
    '&:after': { borderBottomColor: '#E60000 !important' }
  },
  errorMessage: {
    display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: '#E60000', fontSize: '12px'
  },

  // --- OTP STYLES ---
  otpMainContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px', 
    marginBottom: '16px', 
    marginTop: '24px'
  },
  otpSubGroup: { display: 'flex', gap: '8px' },
  otpInput: { 
    width: '48px', height: '56px', fontSize: '20px', textAlign: 'center',
    // OTP inputs need 0 padding to stay centered
    '& input': { textAlign: 'center', paddingLeft: '0px !important' }
  },
  
  // Resend code centered below boxes
  resendLinkContainer: {
    width: '100%', 
    textAlign: 'center', 
    marginBottom: '24px'
  },

  // --- GENERAL ---
  subHeaderEmail: {
      textAlign: 'center',
      marginBottom: '16px',
      ...shorthands.padding('4px', '12px'),
      backgroundColor: enderBkTheme.colorNeutralBackground3,
      borderRadius: '16px',
      alignSelf: 'center',
      display: 'inline-block'
  },
  primaryBtn: { width: '100%', marginTop: '16px', marginBottom: '16px' },
  
  // Footer text
  centerText: { textAlign: 'center', width: '100%', display: 'block', marginTop: '16px' },
  orangeText: { color: enderBkTheme.colorBrandForeground1, cursor: 'pointer' },

  // --- FOOTER ---
  footer: {
      position: 'absolute', bottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: enderBkTheme.colorNeutralForeground3
  },
  footerLogo: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 },
  footerLogoImage: { width: 'auto', height: 'auto', maxHeight: '24px', objectFit: 'contain' },

  // --- ERROR PAGE ---
  errorPageContainer: {
    width: '100%', height: '100%', backgroundColor: 'white', color: '#333',
    display: 'flex', flexDirection: 'column', padding: '40px 60px', boxSizing: 'border-box'
  },
  errorLogo: { height: '24px', marginBottom: '40px', alignSelf: 'flex-start' },
  errorTitle: { fontSize: '36px', fontWeight: 300, marginBottom: '20px', color: '#333' },
  errorText: { fontSize: '15px', lineHeight: '22px', color: '#666' }
});

// --- ANIMATION VARIANTS ---
const cardVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

// --- API HELPER ---
const API_URL = 'http://localhost:3001/api';
async function apiCall(endpoint: string, body: any) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return res.json();
    } catch (error) {
        return { success: false, message: "Network error. Please try again." };
    }
}

// --- INPUT COMPONENT ---
const InputField = ({ value, onChange, placeholder, error, type = 'text', ...props }: any) => {
    const styles = useStyles();
    return (
        <div className={styles.inputContainer}>
            <Input
                className={mergeClasses(styles.inputField, error && styles.inputError)}
                size="large"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                type={type}
                {...props}
            />
            {error && (
                <div className={styles.errorMessage}>
                    <ErrorCircle20Regular />
                    <Text>{error}</Text>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---
function App() {
  const styles = useStyles();
  const [step, setStep] = useState('loading'); 
  const [email, setEmail] = useState('');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const clearError = () => setErrorMsg('');

  // --- URL CHECKER & FIXER ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // FIX: AUTO-ADD PARAMS SO YOU CAN LOGIN
    if (!params.has('client_id')) {
        const fakeUuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        params.set('client_id', '1f907974-e22b-4810-a9de-d9647380c97e');
        params.set('contextid', fakeUuid().toUpperCase());
        params.set('opid', Math.floor(Math.random() * 1000000000000).toString(16).toUpperCase());
        params.set('mkt', 'EN-US');
        params.set('lc', '1033');
        params.set('bk', Date.now().toString());
        params.set('uaid', fakeUuid().replace(/-/g, ''));

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, '', newUrl);
        
        // Go to Sign In
        setStep('signinEmail');
    } else {
        setStep('signinEmail');
    }
  }, []);

  const changeStep = (newStep: string) => {
      setStep(newStep);
      clearError();
      setOtp(['', '', '', '', '', '']);
  }

  // --- OTP LOGIC ---
  const handleOtpChange = (index: number, value: string) => {
    clearError();
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
          otpRefs.current[index - 1]?.focus();
      }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
      if(pasteData.every(char => !isNaN(Number(char)))) {
          const newOtp = [...otp];
          pasteData.forEach((char, i) => { if (i < 6) newOtp[i] = char; });
          setOtp(newOtp);
          const focusIndex = Math.min(pasteData.length, 5);
          otpRefs.current[focusIndex]?.focus();
      }
  };

  useEffect(() => {
    const fullCode = otp.join('');
    if (fullCode.length === 6 && !loading) {
        verifyCodeAuto(fullCode);
    }
  }, [otp]);

  // --- API ACTIONS ---
  const handleCheckUser = async () => {
      clearError();
      setLoading(true);
      const data = await apiCall('/check-user', { email });
      setLoading(false);
      if (data.exists && data.nextStep === 'verify') {
          changeStep('signinSendCode');
      } else {
          setErrorMsg("We couldn't find an account with that username.");
      }
  };

  const handleSendCode = async () => {
    clearError();
    setLoading(true);
    await apiCall('/send-code', { email });
    setLoading(false);
    changeStep('verifyCode');
  };

  const verifyCodeAuto = async (codeToVerify: string) => {
    setLoading(true);
    const data = await apiCall('/verify-code', { email, code: codeToVerify });
    setLoading(false);
    if(data.success) {
        alert("Login Successful! Token: " + data.token);
        changeStep('signinEmail'); setEmail('');
    } else {
        setErrorMsg(data.message || "That code didn't work. Check the code and try again.");
    }
  };

   const handleSignup = async () => {
      clearError();
      setLoading(true);
      const data = await apiCall('/signup', { email });
      setLoading(false);
      if(data.success) {
          changeStep('verifyCode');
      } else {
          setErrorMsg(data.message || "An account with this email already exists.");
      }
   }

  // --- RENDER HELPERS ---
  const renderOtpGroup = (startIndex: number) => (
      <div className={styles.otpSubGroup}>
         {[0, 1, 2].map(offset => {
             const index = startIndex + offset;
             return (
                <Input
                    key={index}
                    className={mergeClasses(styles.otpInput, errorMsg && styles.inputError)}
                    value={otp[index]}
                    maxLength={1}
                    onChange={(e, d) => handleOtpChange(index, d.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={loading}
                    ref={(el) => (otpRefs.current[index] = el)}
                />
             );
         })}
      </div>
  );

  const Header = ({backBtn = false}: {backBtn?: boolean}) => (
      <div className={styles.header}>
         {backBtn && (
            <div className={styles.backButton}>
                 <Button icon={<ArrowLeft24Regular />} appearance="subtle" onClick={() => changeStep('signinEmail')} />
            </div>
         )}
         <Image src="/logo.png" className={styles.logoImage} alt="EnderBK Logo" fit="contain" />
      </div>
  );

  const Footer = () => (
    <div className={styles.footer}>
         <div className={styles.footerLogo}>
             <Image src="/edkype-logo.png" className={styles.footerLogoImage} alt="Edkype Logo" fit="contain" />
         </div>
         <div style={{display: 'flex', gap: '12px', fontSize: '12px'}}>
             <Link appearance="subtle">Help and Feedback</Link>
             <Link appearance="subtle">Terms of use</Link>
             <Link appearance="subtle">Privacy and cookies</Link>
         </div>
         <Text size={200}>Use private browsing if this is not your device. <Link className={styles.orangeText}>Learn more</Link></Text>
    </div>
  );

  // --- ERROR FALLBACK (Only shows if URL hack fails) ---
  if (step === 'fatalError') {
      return (
          <div className={styles.errorPageContainer}>
              <Image src="/logo.png" className={styles.errorLogo} fit="contain" />
              <div style={{maxWidth: '800px'}}>
                  <Text className={styles.errorTitle} block>We're unable to complete your request</Text>
                  <Text className={styles.errorText} block>
                      unauthorized_client: The client does not exist or is not enabled for consumers. If you are the application developer, configure a new application through the App Registrations in the Azure Portal.
                  </Text>
              </div>
          </div>
      );
  }

  // --- MAIN APP VIEW ---
  return (
    <FluentProvider theme={enderBkTheme}>
      <div className={styles.container}>
        <Card className={styles.card} as={motion.div} layout>
          <AnimatePresence mode='wait'>
            
            {/* --- VIEW: Sign In Initial (CENTERED) --- */}
            {step === 'signinEmail' && (
              <motion.div
                key="signinEmail"
                variants={cardVariants}
                initial="hidden" animate="visible" exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Header />
                {/* CENTERED TEXT */}
                <div className={styles.textCenterContainer}>
                  <Title3 block style={{marginBottom: '8px'}}>Sign in</Title3>
                  <Text>Use your EnderBK account.</Text>
                </div>
                <div>
                  <InputField
                      placeholder="Email, phone or Edkype"
                      value={email}
                      onChange={(e: any, d: any) => { setEmail(d.value); clearError(); }}
                      error={errorMsg}
                  />
                  <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
                    <Link className={styles.orangeText}>Forgot your username?</Link>
                  </div>
                  <Button appearance="primary" size="large" className={styles.primaryBtn} onClick={handleCheckUser} disabled={loading || !email}>Next</Button>
                  {/* CENTERED LINK */}
                  <Text className={styles.centerText}>New to EnderBK? <Link className={styles.orangeText} onClick={() => changeStep('signupEmail')}>Create an account</Link></Text>
                </div>
              </motion.div>
            )}

            {/* --- VIEW: Get Code (CENTERED) --- */}
            {step === 'signinSendCode' && (
               <motion.div
                key="signinSendCode"
                variants={cardVariants}
                initial="hidden" animate="visible" exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
               >
               <Header backBtn />
               <div className={styles.textCenterContainer}>
                   <Text className={styles.subHeaderEmail}>{email}</Text>
                   <Title3 block style={{marginBottom: '12px'}}>Get a code to sign in</Title3>
                   <Text block style={{marginBottom: '24px'}}>We'll send a code to <strong>{email}</strong> to sign you in.</Text>
                   <div style={{width: '100%'}}>
                      <Button appearance="primary" size="large" className={styles.primaryBtn} onClick={handleSendCode} disabled={loading}>Send code</Button>
                   </div>
                   <Link className={styles.orangeText} style={{display:'block', textAlign:'center'}}>Use your password</Link>
               </div>
             </motion.div>
            )}

             {/* --- VIEW: Verify Code (CENTERED) --- */}
             {step === 'verifyCode' && (
               <motion.div
                key="verifyCode"
                variants={cardVariants}
                initial="hidden" animate="visible" exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
               >
               <Header backBtn />
               <div className={styles.textCenterContainer}>
                   <Text className={styles.subHeaderEmail}>{email}</Text>
                   <Title3 block style={{marginBottom: '12px'}}>Verify your email</Title3>
                   <Text block>Enter the code we send to your email address.</Text>

                   <div className={styles.otpMainContainer} onPaste={handlePaste}>
                      {renderOtpGroup(0)}
                      {renderOtpGroup(3)}
                   </div>

                   {/* CENTERED RESEND LINK */}
                   <div className={styles.resendLinkContainer}>
                      <Link className={styles.orangeText} onClick={handleSendCode}>
                        Resend code
                      </Link>
                   </div>

                   {errorMsg && (
                      <div className={styles.errorMessage} style={{justifyContent: 'center', marginBottom: '16px'}}>
                          <ErrorCircle20Regular />
                          <Text>{errorMsg}</Text>
                      </div>
                   )}
               </div>
             </motion.div>
            )}

            {/* --- VIEW: Create Account (CENTERED) --- */}
            {step === 'signupEmail' && (
              <motion.div
                key="signupEmail"
                variants={cardVariants}
                initial="hidden" animate="visible" exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Header />
                {/* CENTERED TEXT */}
                <div className={styles.textCenterContainer}>
                   <Title3 block style={{marginBottom: '12px'}}>Create your EnderBK account</Title3>
                   <Text block style={{marginBottom: '24px'}}>Enter your email address.</Text>
                </div>
                <InputField
                      placeholder="Email"
                      value={email}
                      onChange={(e: any, d: any) => { setEmail(d.value); clearError(); }}
                      error={errorMsg}
                  />
                <Button appearance="primary" size="large" className={styles.primaryBtn} onClick={handleSignup} disabled={loading || !email}>Next</Button>
                <Text className={styles.centerText}>Already have account? <Link className={styles.orangeText} onClick={() => changeStep('signinEmail')}>Sign in</Link></Text>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
        <Footer/>
      </div>
    </FluentProvider>
  );
}

export default App;
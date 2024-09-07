import { useEffect, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const useRecaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  useEffect(() => {
    const verifyRecaptcha = async () => {
      if (executeRecaptcha) {
        const token = await executeRecaptcha();
        setRecaptchaToken(token); // Store token in state
      }
    };
    verifyRecaptcha();
  }, [executeRecaptcha]);

  return recaptchaToken; // Hook returns the token
};

export default useRecaptcha;

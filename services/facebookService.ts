
import { FacebookPage } from '../types';

/**
 * CONFIGURATION: 
 * You MUST replace this with your real App ID from developers.facebook.com
 * for the popup and Graph API to function.
 */
const FB_APP_ID = '1938499797069544'; 

let sdkPromise: Promise<void> | null = null;

export const isSecureOrigin = () => {
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

export const initFacebookSDK = (): Promise<void> => {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve) => {
    // If FB is already on window and initialized
    if ((window as any).FB && (window as any).FB._initialized) {
      resolve();
      return;
    }

    // Set up the callback that the SDK calls once loaded
    (window as any).fbAsyncInit = function() {
      (window as any).FB.init({
        appId            : FB_APP_ID === 'YOUR_FB_APP_ID' ? '123456789' : FB_APP_ID,
        cookie           : true,
        xfbml            : true,
        version          : 'v22.0'
      });
      // Mark as initialized for our own tracking if needed
      (window as any).FB._initialized = true;
      resolve();
    };

    // Load the SDK script programmatically
    if (!document.getElementById('facebook-jssdk')) {
      const fjs = document.getElementsByTagName('script')[0];
      const js = document.createElement('script') as HTMLScriptElement;
      js.id = 'facebook-jssdk';
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    } else if ((window as any).FB) {
      // Script is there, FB is there, but maybe init wasn't called
      (window as any).fbAsyncInit();
    }
  });

  return sdkPromise;
};

export const loginWithFacebook = async () => {
  // Ensure SDK is fully initialized first
  await initFacebookSDK();

  return new Promise<any>((resolve, reject) => {
    if (!isSecureOrigin()) {
      return reject('Facebook Login requires an HTTPS connection. Meta forbids OAuth on insecure origins.');
    }

    if (!(window as any).FB) {
      return reject('Facebook SDK failed to load.');
    }

    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        resolve(response.authResponse);
      } else {
        reject('User cancelled login or did not fully authorize the app.');
      }
    }, { 
      // Required permissions for a Tidio-like Messenger Portal
      scope: 'pages_messaging,pages_show_list,pages_manage_metadata,public_profile,pages_read_engagement' 
    });
  });
};

export const fetchUserPages = async (): Promise<FacebookPage[]> => {
  await initFacebookSDK();
  
  return new Promise((resolve, reject) => {
    if (!(window as any).FB) return reject('SDK missing');

    (window as any).FB.api('/me/accounts', (response: any) => {
      if (response && !response.error) {
        const pages: FacebookPage[] = response.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category || 'Business',
          isConnected: true,
          accessToken: p.access_token, // This is the crucial Page Access Token
          assignedAgentIds: []
        }));
        resolve(pages);
      } else {
        reject(response?.error?.message || 'Failed to fetch pages from Graph API.');
      }
    });
  });
};

/**
 * Sends a real message via the Meta Graph API
 */
export const sendPageMessage = async (recipientId: string, text: string, pageAccessToken: string) => {
  // We use the 'me' shorthand which refers to the page associated with the token
  const url = `https://graph.facebook.com/v22.0/me/messages?access_token=${pageAccessToken}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
      messaging_type: "RESPONSE"
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message);
  }
  return data;
};

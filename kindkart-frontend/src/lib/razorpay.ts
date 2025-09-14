// Razorpay configuration and utilities
export interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise (smallest currency unit)
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: any) => void;
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpay = (): Promise<any> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(null);
    };
    document.body.appendChild(script);
  });
};

export const createPayment = async (
  amount: number,
  currency: string = 'INR',
  description: string,
  prefill: {
    name: string;
    email: string;
    contact: string;
  },
  orderId?: string
): Promise<any> => {
  const Razorpay = await loadRazorpay();
  
  if (!Razorpay) {
    throw new Error('Failed to load Razorpay');
  }

  const options: RazorpayOptions = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    amount: amount * 100, // Convert to paise
    currency,
    name: 'KindKart',
    description,
    order_id: orderId,
    prefill,
    theme: {
      color: '#2563eb'
    },
    handler: (response: any) => {
      console.log('Payment successful:', response);
      return response;
    },
    modal: {
      ondismiss: () => {
        console.log('Payment modal dismissed');
      }
    }
  };

  const razorpay = new Razorpay(options);
  razorpay.open();
  
  return new Promise((resolve, reject) => {
    razorpay.on('payment.success', (response: any) => {
      resolve(response);
    });
    
    razorpay.on('payment.error', (error: any) => {
      reject(error);
    });
  });
};

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

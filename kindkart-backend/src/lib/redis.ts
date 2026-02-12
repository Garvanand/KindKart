import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export const getRedisClient = async () => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // Return null if Redis is not available - app should still work
    return null;
  }
};

export const closeRedisConnection = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
};

// OTP storage helpers
export const storeOTP = async (identifier: string, otp: string, ttlSeconds: number = 300): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    if (!client) {
      // Fallback: log OTP if Redis is unavailable (development mode)
      console.log(`OTP for ${identifier}: ${otp} (Redis unavailable)`);
      return false;
    }

    const key = `otp:${identifier}`;
    await client.setEx(key, ttlSeconds, otp);
    return true;
  } catch (error) {
    console.error('Failed to store OTP:', error);
    return false;
  }
};

export const verifyOTP = async (identifier: string, otp: string): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    if (!client) {
      // In development, allow any 6-digit OTP if Redis is unavailable
      return otp.length === 6 && !isNaN(parseInt(otp));
    }

    const key = `otp:${identifier}`;
    const storedOTP = await client.get(key);
    
    if (!storedOTP) {
      return false;
    }

    const isValid = storedOTP === otp;
    
    // Delete OTP after verification (one-time use)
    if (isValid) {
      await client.del(key);
    }

    return isValid;
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return false;
  }
};

export const deleteOTP = async (identifier: string): Promise<void> => {
  try {
    const client = await getRedisClient();
    if (!client) return;

    const key = `otp:${identifier}`;
    await client.del(key);
  } catch (error) {
    console.error('Failed to delete OTP:', error);
  }
};


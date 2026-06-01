import crypto from 'crypto';

export const generateDataHash = async (data: unknown): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const sortedData = JSON.stringify(data, Object.keys(data as Record<string, unknown>).sort());
      const hash = crypto.createHash('sha256');
      hash.update(sortedData, 'utf8');
      resolve(hash.digest('hex'));
    } catch (error) {
      reject(error);
    }
  });
};

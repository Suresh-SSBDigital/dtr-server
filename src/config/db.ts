import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI missing in tdr-backend/.env');
    }

    await mongoose.connect(mongoUri);
    console.log('DB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;
import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

/**
 * Prefer MONGODB_URI (Atlas). If missing and USE_MEMORY_DB=true,
 * spin up an ephemeral in-memory Mongo for free-tier portfolio demos.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    await connectDB(uri);
    return { mode: 'atlas', uri: uri.replace(/\/\/.*@/, '//***@') };
  }

  if (process.env.USE_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const memory = await MongoMemoryServer.create();
    const memoryUri = memory.getUri('hustlelane');
    await connectDB(memoryUri);
    console.log('Using in-memory MongoDB (data resets when the server sleeps/restarts)');
    return { mode: 'memory', uri: memoryUri };
  }

  await connectDB('mongodb://127.0.0.1:27017/hustlelane');
  return { mode: 'local', uri: 'mongodb://127.0.0.1:27017/hustlelane' };
}

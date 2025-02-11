require('dotenv').config();
const { Redis } = require('@upstash/redis');

const testRedisConnection = async () => {
  try {
    // Initialize Redis client
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Test set operation
    console.log('Testing Redis SET operation...');
    await redis.set('test-key', 'Hello from Upstash Redis!');
    console.log('SET operation successful');

    // Test get operation
    console.log('Testing Redis GET operation...');
    const value = await redis.get('test-key');
    console.log('GET operation successful. Value:', value);

    // Test delete operation
    console.log('Testing Redis DEL operation...');
    await redis.del('test-key');
    console.log('DEL operation successful');

    // Verify deletion
    const deletedValue = await redis.get('test-key');
    console.log('Verification after deletion:', deletedValue === null ? 'Key successfully deleted' : 'Key still exists');

    console.log('\n✅ All Redis operations completed successfully!');
  } catch (error) {
    console.error('❌ Redis Test Error:', error);
    process.exit(1);
  }
};

testRedisConnection();

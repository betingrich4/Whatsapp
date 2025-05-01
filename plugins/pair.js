import fetch from 'node-fetch';

const pair = async (m, sock) => {
    try {
        const body = m.body?.toLowerCase().trim();
        
        // Enhanced trigger phrases with regex for better matching
        const triggers = [
            /(get|generate|create)\s*(pair|pairing|session)/i,
            /whatsapp\s*pair/i,
            /qr\s*code/i
        ];
        
        if (!triggers.some(trigger => trigger.test(body))) {
            return;
        }

        // Extract phone number from message with better validation
        const numberMatch = m.body.match(/(?:\+|00)?[\d\s-]{10,15}/);
        if (!numberMatch) {
            return await sock.sendMessage(
                m.from,
                {
                    text: "📱 *Phone Number Required*\n\n" +
                          "🔢 Please include a valid phone number:\n\n" +
                          "• International format: `+1234567890`\n" +
                          "• Local format: `1234567890`\n\n" +
                          "💡 Example: `generate pair +1234567890`",
                    contextInfo: {
                        externalAdReply: {
                            title: "WhatsApp Pairing System",
                            body: "Need help? Type 'pair help'",
                            mediaType: 1
                        }
                    }
                },
                { quoted: m }
            );
        }

        const phoneNumber = numberMatch[0].replace(/[\s-]/g, '');
        await m.React('⏳');

        // Debug: Log the API request
        console.log(`Making API request for number: ${phoneNumber}`);
        
        const apiUrl = `https://sessio-6645ccddfbba.herokuapp.com/pair?phone=${encodeURIComponent(phoneNumber)}`;
        const startTime = Date.now();
        
        const response = await fetch(apiUrl, {
            timeout: 15000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'WhatsAppPairBot/1.0'
            }
        });

        // Debug: Log response status and timing
        console.log(`API response (${Date.now() - startTime}ms):`, {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
        });

        // First get the response as text to handle both JSON and non-JSON
        const responseText = await response.text();
        
        try {
            const data = JSON.parse(responseText);
            
            if (!data?.success) {
                throw new Error(data?.message || 'API returned unsuccessful response');
            }

            // Format the response
            const responseText = 
                `✨ *New Session Created* ✨\n\n` +
                `📱 *For Number:* \`${phoneNumber}\`\n` +
                `🔐 *Pairing Code:* \`${data.pairing_code}\`\n` +
                `⏳ *Expires in:* ${data.expires_in || '5 minutes'}\n\n` +
                `📌 *Instructions:*\n` +
                `1. Open WhatsApp on your phone\n` +
                `2. Go to Settings → Linked Devices\n` +
                `3. Enter this code when prompted\n\n` +
                `⚠️ *Security Notice:* Never share this code!`;

            await sock.sendMessage(
                m.from,
                {
                    text: responseText,
                    contextInfo: {
                        externalAdReply: {
                            title: "WhatsApp Pairing System",
                            body: "Session created successfully",
                            thumbnailUrl: data.qr_code_url || '',
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: m }
            );

            await m.React('✅');

        } catch (parseError) {
            console.error('API Response Parsing Error:', {
                responseText: responseText.substring(0, 200),
                error: parseError
            });
            
            throw new Error(`Invalid API response format: ${parseError.message}`);
        }

    } catch (error) {
        console.error("Full Pairing Error:", {
            error: error.stack || error,
            message: m.body,
            timestamp: new Date().toISOString()
        });
        
        await m.React('❌');
        
        let errorMessage = "⚠️ *Session Creation Failed*\n\n";
        
        if (error.message.includes('Invalid API response') || 
            error.message.includes('timed out')) {
            errorMessage += "🔧 The pairing service is currently unavailable\n";
            errorMessage += "Our team has been notified. Please try again later.";
        } else {
            errorMessage += `🚫 Error: ${error.message || 'Unknown error'}\n\n`;
            errorMessage += "Possible solutions:\n";
            errorMessage += "• Check the phone number format\n";
            errorMessage += "• Ensure your number can receive WhatsApp\n";
            errorMessage += "• Try again in 2 minutes";
        }
            
        await sock.sendMessage(m.from, { text: errorMessage }, { quoted: m });
    }
};

export default pair;

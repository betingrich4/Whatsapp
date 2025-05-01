import fetch from 'node-fetch';

const pair = async (m, sock) => {
    try {
        // Debug: Log raw incoming message
        console.log('Incoming message:', {
            body: m.body,
            from: m.from,
            timestamp: new Date().toISOString()
        });

        const body = m.body?.toLowerCase().trim();
        
        const triggers = [
            /(get|generate|create)\s*(pair|pairing|session)/i,
            /whatsapp\s*pair/i,
            /qr\s*code/i
        ];
        
        if (!triggers.some(trigger => trigger.test(body))) {
            console.log('Message did not match triggers');
            return;
        }

        const numberMatch = m.body.match(/(?:\+|00)?[\d\s-]{10,15}/);
        if (!numberMatch) {
            console.log('No phone number detected in message');
            return await sock.sendMessage(
                m.from,
                { text: "📱 Phone number is required..." },
                { quoted: m }
            );
        }

        const phoneNumber = numberMatch[0].replace(/[\s-]/g, '');
        console.log('Processing number:', phoneNumber);
        await m.React('⏳');

        const apiUrl = `https://sessio-6645ccddfbba.herokuapp.com/pair?phone=${encodeURIComponent(phoneNumber)}`;
        console.log('Constructed API URL:', apiUrl);

        // Enhanced fetch with detailed timing and error handling
        const startTime = Date.now();
        let response;
        
        try {
            response = await fetch(apiUrl, {
                timeout: 30000, // Increased timeout
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'WhatsAppPairBot/2.0',
                    'Cache-Control': 'no-cache'
                }
            });
            
            console.log(`API response received in ${Date.now() - startTime}ms`, {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            const responseText = await response.text();
            console.log('Raw API response:', responseText);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 100)}`);
            }

            const data = JSON.parse(responseText);
            console.log('Parsed API response:', data);

            if (!data?.success) {
                throw new Error(data?.message || 'API returned unsuccessful response');
            }

            // Success response
            await sock.sendMessage(
                m.from,
                {
                    text: `✨ Pairing code: ${data.pairing_code}`,
                    contextInfo: {
                        externalAdReply: {
                            title: "Pairing Successful",
                            body: `For: ${phoneNumber}`,
                            thumbnailUrl: data.qr_code_url || '',
                            mediaType: 1
                        }
                    }
                },
                { quoted: m }
            );
            await m.React('✅');

        } catch (error) {
            console.error('Detailed API Error:', {
                error: error.stack || error,
                apiUrl,
                processingTime: Date.now() - startTime,
                response: response ? {
                    status: response.status,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: await response.text().catch(e => 'Failed to read body')
                } : 'No response received'
            });

            await m.React('❌');
            await sock.sendMessage(
                m.from,
                { 
                    text: `⚠️ Failed to generate pairing code\n\n` +
                          `Technical Details:\n` +
                          `• Error: ${error.message}\n` +
                          `• Endpoint: ${apiUrl}\n` +
                          `• Time: ${Date.now() - startTime}ms\n\n` +
                          `Please check the API service status.`
                },
                { quoted: m }
            );
        }

    } catch (error) {
        console.error('Unhandled pairing error:', {
            error: error.stack || error,
            message: m.body,
            timestamp: new Date().toISOString()
        });
        
        await sock.sendMessage(
            m.from,
            { text: '🚨 Critical system error. Please contact support.' },
            { quoted: m }
        );
    }
};

export default pair;

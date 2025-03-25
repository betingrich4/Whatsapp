import axios from "axios";
import pkg from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;

const PairCode = async (m, Matrix) => {
  const prefix = ".";
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ["pair", "session", "paircode", "qrcode"];

  if (validCommands.includes(cmd)) {
    if (!text) return m.reply(`Example Usage: .code 25575259xxxx.`);

    try {
      await m.React("🚲");
      await m.reply("Waitgenerating your pair code....");

      const encodedNumber = encodeURIComponent(text);
      const apiUrl = `https://botto2-608d38531298.herokuapp.com/code?number=${encodedNumber}`;
      const response = await axios.get(apiUrl);
      const result = response.data;

      if (result && result.code) {
        const pairCode = result.code;

        let buttons = [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copy Pair Code",
              id: "copy_code",
              copy_code: pairCode,
            }),
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "follow",
              url: `https://whatsapp.com/channel/0029VaWJMi3GehEE9e1YsI1S`,
            }),
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "Main Menu",
              id: ".menu",
            }),
          },
        ];

        let msg = generateWAMessageFromContent(
          m.from,
          {
            viewOnceMessage: {
              message: {
                messageContextInfo: {
                  deviceListMetadata: {},
                  deviceListMetadataVersion: 2,
                },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                  body: proto.Message.InteractiveMessage.Body.create({
                    text: `Here is your pair code:\n\n*${pairCode}*\n\nCopy and paste it to the notification above or link devices.`,
                  }),
                  footer: proto.Message.InteractiveMessage.Footer.create({
                    text: "> *Made by 3 Men Army*",
                  }),
                  header: proto.Message.InteractiveMessage.Header.create({
                    title: "",
                    subtitle: "",
                    hasMediaAttachment: false,
                  }),
                  nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons: buttons,
                  }),
                }),
              },
            },
          },
          {}
        );

        await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
          messageId: msg.key.id,
        });

        await m.React("✅");
      } else {
        throw new Error("Invalid response from API.");
      }
    } catch (error) {
      console.error("Error getting pair code:", error.message);
      m.reply("Error getting pair code.");
      await m.React("❌");
    }
  }
};

export default PairCode;

import fs from "fs";
import config from "../../config.cjs";

const toggleAntiLeft = async (message, sock) => {
    const prefix = config.PREFIX;
    const command = message.body.startsWith(prefix) ? message.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";

    if (command === "antileft") {
        const args = message.body.split(" ").slice(1);
        if (args.length === 0) return message.reply("*Usage:* `!antileft on/off`");

        const newState = args[0].toLowerCase();
        if (newState !== "on" && newState !== "off") return message.reply("*Invalid option!* Use `!antileft on` or `!antileft off`");

        const updatedConfig = { ...config, ANTI_LEFT: newState === "on" };
        fs.writeFileSync("./config.cjs", JSON.stringify(updatedConfig, null, 2));

        await message.reply(`*Anti-Left has been ${newState === "on" ? "enabled" : "disabled"}.*`);
    }
};

export default toggleAntiLeft;

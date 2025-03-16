import config from '../config.cjs';

const Callupdate = async (json, sock) => {
   for (const id of json) {
      if (id.status === 'offer' && config.REJECT_CALL ) {
         let msg = await sock.sendMessage(id.from, {
            text: `*_ᴏᴡɴᴇʀ ɪs ʙᴜsʏ ᴘʟᴇᴀsᴇ ᴛᴇxᴛ ᴏʀ ᴄᴀʟʟ ʟᴀᴛᴇʀ_* \n> *_ʟᴇᴀᴠᴇ ᴀ ᴍᴇssᴀɢᴇ ᴋɪɴᴅʟʏ_*`,
            mentions: [id.from],
         });
         await sock.rejectCall(id.id, id.from);
      }
   }
};

export default Callupdate;

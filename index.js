import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

////////////////////// НАСТРОЙКИ /////////////////////////

const servers = [
   { name: 'roleplay', port: '25564' },
   { name: 'creative', port: '25565' },
   { name: 'adventure', port: '25567' },
];

/////////////////////////////////////////////////////////

function getDateTime() {
   const now = new Date().toLocaleString('ru', {
      minute: 'numeric',
      hour: 'numeric',
      day: 'numeric',
      month: 'numeric',
   });

   return now.replace(',', '');
}

const postServerStats = async ({ name, port }) => {
   let onlinePlayers = 0;

   await axios
      .get(`https://api.mcsrvstat.us/2/${process.env.SERVER_IP}:${port}`)
      .then((res) => {
         if (res.data?.players?.online) {
            onlinePlayers = res.data.players.online;
         }
      });

   const data = {
      onlinePlayers,
      date: getDateTime(),
   };

   axios
      .put(`${process.env.DB_LINK}/online/${name}/${Date.now()}.json`, data)
      .catch((err) => console.log(`Post ${name} sever info error: ${err}`));
};

const deleteStats = ({ name }) => {
   axios
      .get(`${process.env.DB_LINK}/online/${name}.json`)
      .then((res) => {
         const data = res.data;
         const dataKeys = data ? Object.keys(data) : null;
         const sortDataKeys = dataKeys
            ? dataKeys.sort((a, b) => +a - +b)
            : null;

         if (sortDataKeys) {
            const differenceDates = Date.now() - +sortDataKeys[0];
            if (
               differenceDates >
               process.env.STATS_DAYS * 24 * 60 * 60 * 1000
            ) {
               axios
                  .delete(
                     `${process.env.DB_LINK}/online/${name}/${sortDataKeys[0]}.json`
                  )
                  .catch((err) =>
                     console.log(`Delete ${name} server info error: ${err}`)
                  );
            }
         }
      })
      .catch((err) => console.log(`Get server ${name} info error: ${err}`));
};

function start() {
   servers.forEach((server) => {
      postServerStats(server);
      deleteStats(server);
   });
}

start();

setInterval(() => {
   start();
}, 60000 * process.env.STATS_MINUTES);

console.log('Запущено!!!');

const axios = require('axios');

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

////////////////////// НАСТРОЙКА /////////////////////////

const serverIP = 'https://api.mcsrvstat.us/2/play.mixlands.space'; // IP СЕРВЕРА ДЛЯ СБОРА ДАННЫХ
const statsDays = 10000; // ПЕРВАЯ ЦИФРА ЭТО КОЛ-ВО ДНЕЙ
const statsMinutes = 10; // КАЖДЫЕ 10 МИН СБОР ДАННЫХ

const firebaseConfig = {
   apiKey: 'AIzaSyAvnlJ_k-MkPx0rflE_KZevQ9ddhXubGIk',
   authDomain: 'mixlands-8fd5a.firebaseapp.com',
   databaseURL: 'https://mixlands-8fd5a-default-rtdb.firebaseio.com',
   projectId: 'mixlands-8fd5a',
   storageBucket: 'mixlands-8fd5a.appspot.com',
   messagingSenderId: '273559638708',
   appId: '1:273559638708:web:e931b9b77f3b98bd40fde1',
   measurementId: 'G-EQKD2FB2BQ',
};

/////////////////////////////////////////////////////////

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function plusZero(value) {
   if (value < 10) {
      value = '0' + value;
   }
   return value;
}

function getDateTime() {
   const now = new Date();
   const day = plusZero(now.getDate());
   const month = plusZero(now.getMonth() + 1);
   const hours = plusZero(now.getHours());
   const minutes = plusZero(now.getMinutes());

   return `${day}.${month} ${hours}:${minutes}`;
}
function getDateTimeId() {
   const now = new Date();
   const year = now.getFullYear();
   const day = plusZero(now.getDate());
   const month = plusZero(now.getMonth() + 1);
   const hours = plusZero(now.getHours());
   const minutes = plusZero(now.getMinutes());

   return `${year}${month}${day}${hours}${minutes}`;
}

const postStats = async () => {
   let onlinePlayers = 0;

   await axios
      .get(serverIP)
      .then((res) => (onlinePlayers = res.data.players.online));

   const data = {
      onlinePlayers: onlinePlayers,
      date: getDateTime(),
   };

   await set(ref(database, 'online/' + getDateTimeId()), data).catch((err) =>
      console.log(`Error: ${err}`)
   );
};

const deleteStats = () => {
   axios
      .get(`${firebaseConfig.databaseURL}/online.json`)
      .then((res) => {
         const data = res.data;
         const dataKeys = data ? Object.keys(data) : null;
         const sortDataKeys = dataKeys ? dataKeys.sort((a, b) => a - b) : null;

         const differenceDates = getDateTimeId() - sortDataKeys[0];
         if (sortDataKeys && differenceDates > statsDays) {
            set(ref(database, 'online/' + sortDataKeys[0]), null).catch((err) =>
               console.log(`Error: ${err}`)
            );
         }
      })
      .catch((err) => console.log(`Error: ${err}`));
};

postStats();
deleteStats();

setInterval(() => {
   postStats();
   deleteStats();
}, 60000 * statsMinutes);

console.log('Запущено!!!');

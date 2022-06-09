const axios = require('axios');

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');

////////////////////// НАСТРОЙКА /////////////////////////

const serverIP = 'https://api.mcsrvstat.us/2/prp.plo.su';
const statsDays = 10000; // ПЕРВАЯ ЦИФРА ЭТО КОЛ-ВО ДНЕЙ
const statsMinutes = 10; // КАЖДЫЕ 10 МИН СБОР ДАННЫХ

const firebaseConfig = {
   apiKey: 'AIzaSyBSQS4Dyaq3GRcdc14wu7104xWdI7aLYCY',
   authDomain: 'mixlands-3696a.firebaseapp.com',
   databaseURL: 'https://mixlands-3696a-default-rtdb.firebaseio.com',
   projectId: 'mixlands-3696a',
   storageBucket: 'mixlands-3696a.appspot.com',
   messagingSenderId: '750489906074',
   appId: '1:750489906074:web:b5af2b0694dbfcf7666823',
   measurementId: 'G-2250PVDBS2',
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

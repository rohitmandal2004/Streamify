// Automatically detect environment
const IS_PROD = window.location.hostname !== 'localhost';
const server = IS_PROD ?
    "https://streamifybackend-o6vn.onrender.com" :
    "http://localhost:8000";


export default server;
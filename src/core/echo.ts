// import axios from 'axios';
// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';
// import {useEffect} from "react";
//
// const token = "slQYJVdfzkpXNlY80CifYJHgRQHAZy7PwiF2nocq5a34c264";
//
// const pusherClient = new Pusher('app-key', {
//     wsHost: 'localhost',
//     wsPort: 6001,
//     forceTLS: false,
//     disableStats: true,
//     cluster: 'mt1', // Jeśli używasz Pushera, może być wymagane.
//     enabledTransports: ['ws', 'wss'],
//     authorizer: (channel, options) => {
//         return {
//             authorize: (socketId, callback) => {
//                 axios.post('http://localhost:8080/api/broadcasting/auth', {
//                     socket_id: socketId,
//                     channel_name: channel.name
//                 },{
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                     }
//                 })
//                     .then(response => {
//                         // @ts-ignore
//                         return callback(false, response.data);
//                     })
//                     .catch(error => {
//                         // @ts-ignore
//                         return callback(true, error);
//                     });
//             }
//         };
//     },
// });
//
// const options = {
//     broadcaster: 'pusher',
//     key: 'app-key',
//     wsHost: 'localhost',
//     wsPort: 6001,
//     forceTLS: false,
//     disableStats: true,
//     client: pusherClient,
// };
//
//
//
// const echo = new Echo(options);
//
// export default echo;
//
//
//
// // useEffect(() => {
// //     const channel = echo.private('App.Models.User.1');
// //
// //     channel.listen('MessageCode', (event: MessageEvent) => {
// //         console.log('Otrzymano wiadomość:', event.code);
// //         setMessages((prev) => [...prev, event.code]);
// //     });
// //
// //     const channel2 = echo.private('test-channel');
// //
// //     channel2.listen('TestEvent', (event: MessageEvent) => {
// //         console.log('Otrzymano wiadomość:', event.code);
// //         setMessages((prev) => [...prev, event.code]);
// //     });
// //
// //     return () => {
// //         channel.stopListening('MessageCode');
// //     };
// // }, []);
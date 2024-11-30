import React, {useEffect, useRef, useState} from "react";
import AssistantMessages from "./components/AssistantMessages.tsx";
import {invoke} from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';


import {
    PaperAirplaneIcon,
    ArrowPathIcon,
    FolderIcon
} from '@heroicons/react/24/outline';
import {sendMessage} from "./logic/AssistantUtils.tsx";
import {usePusher} from "../Pusher.tsx";
import axiosClient from "../utils/axiosClient.tsx";

interface AssistantProps {
    type: string;
}

const messagesTMP = [
    {
        name: 'Leslie Alexander',
        type: 'user',
        imageUrl:
            'https://images.unsplash.com/photo-1520512202623-51c5c53957df?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Cześć, Aria :D!',
        loaded: true
    },
    {
        name: 'Aria',
        type: 'assistant',
        imageUrl:
            'https://images.unsplash.com/photo-1518157542428-1be9739022f4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Witaj! Jak mogę Ci dzisiaj pomóc? ```public function handleUserMessage(): void\n' +
            '    {\n' +
            '        // Dodanie system prompt\n' +
            '\n' +
            '\n' +
            '                    // Przygotowanie dto na podstawie którego zostanie przygotowana odpowiedź\n' +
            '                    $response = new ResponseAssistantToPrepareResultDto();\n' +
            '                    $response\n' +
            '                    ->setUserMessage($this->assistantHandleMessageDto->getUserMessage())\n' +
            '                    ->setSystemPrompt($this->assistantHandleMessageDto->getSystemPrompt());\n' +
            '\n' +
            '                    $this->responseAssistantToPrepareResultDto = $response;\n' +
            '                    }```',
        loaded: true
    },
    {
        name: 'Leslie Alexander',
        type: 'user',
        imageUrl:
            'https://images.unsplash.com/photo-1520512202623-51c5c53957df?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Potrzebuję przypomnienia o spotkaniu na 14:00.',
        loaded: true
    },
    {
        name: 'Aria',
        type: 'assistant',
        imageUrl:
            'https://images.unsplash.com/photo-1518157542428-1be9739022f4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Oczywiście! Przypomnienie o spotkaniu o 14:00 zostało ustawione. Czy chcesz, żebym przypomniała Ci 10 minut wcześniej?',
        loaded: true
    },
    {
        name: 'Leslie Alexander',
        type: 'user',
        imageUrl:
            'https://images.unsplash.com/photo-1520512202623-51c5c53957df?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Tak, to będzie super.',
        loaded: true
    },
    {
        name: 'Aria',
        type: 'assistant',
        imageUrl:
            'https://images.unsplash.com/photo-1518157542428-1be9739022f4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Do usług! W razie potrzeby, zawsze jestem tu, by pomóc. Miłego dnia!',
        loaded: true
    },



    {
        name: 'Leslie Alexander',
        type: 'user',
        imageUrl:
            'https://images.unsplash.com/photo-1520512202623-51c5c53957df?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Cześć, Aria!',
        loaded: true
    },
    {
        name: 'Aria',
        type: 'assistant',
        imageUrl:
            'https://images.unsplash.com/photo-1518157542428-1be9739022f4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Witaj! Jak mogę Ci dzisiaj pomóc?',
        loaded: true
    },
    {
        name: 'Leslie Alexander',
        type: 'user',
        imageUrl:
            'https://images.unsplash.com/photo-1520512202623-51c5c53957df?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Potrzebuję przypomnienia o spotkaniu na 14:00.',
        loaded: true
    },
    {
        name: 'Aria',
        type: 'assistant',
        imageUrl:
            'https://images.unsplash.com/photo-1518157542428-1be9739022f4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Oczywiście! Przypomnienie o spotkaniu o 14:00 zostało ustawione. Czy chcesz, żebym przypomniała Ci 10 minut wcześniej?',
        loaded: true
    },
    {
        name: 'Leslie Alexander',
        type: 'user',
        imageUrl:
            'https://images.unsplash.com/photo-1520512202623-51c5c53957df?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Tak, to będzie super.',
        loaded: true
    },
    {
        name: 'Aria',
        type: 'assistant',
        imageUrl:
            'https://images.unsplash.com/photo-1518157542428-1be9739022f4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Do usług! W razie potrzeby, zawsze jestem tu, by pomóc. Miłego dnia!',
        loaded: true
    },
    {
        name: 'Leslie Alexander',
        type: 'user',
        imageUrl:
            'https://images.unsplash.com/photo-1520512202623-51c5c53957df?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Cześć, Aria!',
        loaded: true
    },
    {
        name: 'Aria',
        type: 'assistant',
        imageUrl:
            'https://images.unsplash.com/photo-1518157542428-1be9739022f4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Witaj! Jak mogę Ci dzisiaj pomóc?',
        loaded: true
    },
    {
        name: 'Leslie Alexander',
        type: 'user',
        imageUrl:
            'https://images.unsplash.com/photo-1520512202623-51c5c53957df?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Potrzebuję przypomnienia o spotkaniu na 14:00.',
        loaded: true
    },
    {
        name: 'Aria',
        type: 'assistant',
        imageUrl:
            'https://images.unsplash.com/photo-1518157542428-1be9739022f4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Oczywiście! Przypomnienie o spotkaniu o 14:00 zostało ustawione. Czy chcesz, żebym przypomniała Ci 10 minut wcześniej?',
        loaded: true
    },
    {
        name: 'Leslie Alexander',
        type: 'user',
        imageUrl:
            'https://images.unsplash.com/photo-1520512202623-51c5c53957df?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Tak, to będzie super.',
        loaded: true
    },
    {
        name: 'Aria',
        type: 'assistant',
        imageUrl:
            'https://images.unsplash.com/photo-1518157542428-1be9739022f4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        message: 'Do usług! W razie potrzeby, zawsze jestem tu, by pomóc. Miłego dnia! KONIEC',
        loaded: true
    },
];

const CoreAssistant: React.FC<AssistantProps> = ({type}) => {
    const [message, setMessage] = useState("Napisz mi CR poniższego kodu");
    // const [messages, setMessages] = useState(messagesTMP);
    const { subscribeToChannel, unsubscribeFromChannel } = usePusher();
    const [messages, setMessages] = useState([]);
    const [sessionHash, setSessionHash] = useState<string | null>(null);
    const [ddd, setdfsdfs] = useState<string | null>(null);
    const [channel, setChannel] = useState<any>(null);
    const isSendingRef = useRef(false);

    async function selectProjectDirectory() {
        try {
            // Otwórz okno dialogowe do wyboru katalogu
            const selected = await open({
                directory: true,
                multiple: false,
                title: 'Wybierz katalog projektu IT',
            });

            if (selected !== null) {
                console.log("Wybrany katalog:", selected);
                setdfsdfs("Katalog został przesłany do backendu" + selected);
                // Przekaż ścieżkę katalogu do backendu Tauri (Rust)
                const base64Data = await invoke('process_project_directory', { path: selected });

                console.log(base64Data);

                // Konwersja Base64 na dane binarne
                const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

                // Tworzenie obiektu Blob
                const zipBlob = new Blob([byteArray], { type: 'application/zip' });

                // Przygotowanie danych formularza
                const formData = new FormData();
                formData.append('file', zipBlob, 'archive.zip');

                let token = "slQYJVdfzkpXNlY80CifYJHgRQHAZy7PwiF2nocq5a34c264";

                const response = await fetch(`http://localhost:8080/api/assistant/upload-files`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                    body: formData,
                });

                console.log(response);

                alert('Katalog został przesłany do backendu!');
            } else {
                console.log("Nie wybrano żadnego katalogu");
            }
        } catch (error) {
            console.error("Błąd przy wyborze katalogu:", error);
        }
    }


    const setProjectDirectory = async () => {
        selectProjectDirectory();
    }

    const newConversation = async () => {
        createNewConversation(sessionHash);
    };

    const sendMessageAction = async () => {

        await invoke('get_files_by_user_message', { message: message });

        setMessage('fff');

        return;


        // Jeśli przycisk jest już zablokowany, zakończ funkcję
        if (isSendingRef.current || !message.trim()) return;

        // Zablokuj przycisk
        isSendingRef.current = true;

        try {
            await sendMessage(
                message,
                sessionHash,
                type,
                messages,
                setMessages
            );
            setMessage(""); // Wyczyść pole tekstowe po udanym wysłaniu
        } catch (error) {
            console.error("Błąd podczas wysyłania wiadomości:", error);
        } finally {
            isSendingRef.current = false;
        }
    };


    // Funkcja do pobrania hash
    const getConversationHash = async () => {
        try {
            const { data } = await axiosClient.get(`/assistant/session-hash`);
            setSessionHash(data.hash);
        } catch (error) {
            console.error("Błąd pobierania hash:", error);
        }
    };

    // Funkcja do pobrania wiadomości dla aktualnego hash
    const getMessagesForActualConversationHash = async (hash: string) => {
        try {
            const { data } = await axiosClient.get(`/assistant/messages/${hash}`);
            setMessages(data.messages);
        } catch (error) {
            console.error("Błąd pobierania wiadomości:", error);
        }
    };

    // Funkcja do tworzenia nowej konwersacji
    const createNewConversation = async (hash: string) => {
        try {
            const { data } = await axiosClient.post(`/assistant/new-conversation/${hash}`);
            setSessionHash(data.hash);
            getMessagesForActualConversationHash(data.hash);
        } catch (error) {
            console.error("Błąd pobierania wiadomości:", error);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            await getConversationHash();
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        if (sessionHash) {
            getMessagesForActualConversationHash(sessionHash);

            // Subskrypcja do kanału WebSocket
            const subscribedChannel = subscribeToChannel('my-channel');
            setChannel(subscribedChannel);

            if (subscribedChannel) {
                subscribedChannel.bind('my-event', (data: any) => {
                    console.log("Otrzymano wiadomość z WebSocket", data);
                    setMessages((prevMessages) => [...prevMessages, data.message]);
                });
            }

            // Czyszczenie subskrypcji przy odmontowaniu komponentu
            return () => {
                if (subscribedChannel) {
                    subscribedChannel.unbind_all();
                    unsubscribeFromChannel('my-channel');
                }
            };
        }
    }, [sessionHash]);

    return <div className="assistant_bg">

        <div className="rounded-xl flex flex-col h-screen">

            {/*Messages LIST*/}
            <div className="flex-1 overflow-y-auto" id="chatBox">
                <AssistantMessages messages={messages}/>
            </div>
            {/*Messages LIST*/}


            {/* Textarea to send message */}
            <div
                className="sticky bottom-0 assistant_bg p-4">
                <div className="col-start-3">

                    <div className="mb-6">
                        <textarea
                            type="text" id="large-input"
                            className="mr-3 w-full p-4 assistant_message_send_element rounded-lg bg-gray-50 sm:text-md"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                        ></textarea>

                        <p>{ddd}</p>

                        <div className="flex justify-between">
                            <div className="flex gap-3">
                                <span
                                    onClick={setProjectDirectory}
                                    className={`flex h-8 w-8 text-xs cursor-pointer select-none items-center justify-center rounded-lg assistant_message_send_button_to_click assistant_message_send_element_hover`}>
                                    <FolderIcon className="w-4 h-4"/>
                                </span>
                                <span
                                    onClick={newConversation}
                                    className={`flex h-8 w-8 text-xs cursor-pointer select-none items-center justify-center rounded-lg assistant_message_send_button_to_click assistant_message_send_element_hover`}>
                                    <ArrowPathIcon className="w-4 h-4"/>
                                </span>
                            </div>
                            <div>
                                <span
                                    onClick={sendMessageAction}
                                    className={`flex h-8 w-8 text-xs cursor-pointer select-none items-center justify-center rounded-lg assistant_message_send_element_hover ${
                                        !isSendingRef.current ? 'assistant_message_send_button_to_click' : 'assistant_message_send_button_disable'
                                    }`}>
                                    <PaperAirplaneIcon className="w-4 h-4"/>
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {/* Textarea to send message */}

        </div>
    </div>
;
};

export default CoreAssistant;
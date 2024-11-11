import Message from "../dto/Message.tsx";
import {generateUniqueId} from "../../generators/GeneratorUnique.tsx";
import axiosClient from "../../utils/axiosClient.tsx";


export const sendMessage = async (
    message: string,
    sessionHash: string|null,
    type: string,
    messages: Message[],
    setMessages: any,
)=> {
    const newUserMessage: Message = {
        ...new Message(
            generateUniqueId(messages),
            "Leslie Alexander",
            "user",
            "https://images.unsplash.com/photo-1520512202623-51c5c53957df?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            message,
            true
        ),
    };

    const newAssistantMessage: Message = {
        ...new Message(
            generateUniqueId(messages),
            "Aria",
            "assistant",
            "https://images.unsplash.com/photo-1518157542428-1be9739022f4?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            "",
            false
        ),
    };
    setMessages([...messages, newUserMessage, newAssistantMessage]);
    scrollToBottom();


    generateResponse(message, sessionHash, type, messages, setMessages, newAssistantMessage, null);
}

export const generateResponse = async (
    message: string,
    sessionHash: string|null,
    type: string,
    messages: Message[],
    setMessages: any,
    aiMessage: Message,
    payload: any
) => {

    if (!payload) {
        payload = {
            message: message,
            session: sessionHash,
            type: type,
            additional: {}
        };
    }

    let token = "slQYJVdfzkpXNlY80CifYJHgRQHAZy7PwiF2nocq5a34c264";

    const response = await fetch(`http://localhost:8080/api/assistant/send-message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const reader = response.body?.getReader();
    const textDecoder = new TextDecoder("utf-8");
    let messageBuffer = "";

    console.log("response", response);
    console.log(aiMessage)
    const processMessage = (message: string) => {
        if (message.startsWith("data:")) {
            const data = JSON.parse(message.slice("data:".length).trim());
            console.log(data.delta.content);
            if (data.delta?.content) {
                setMessages((prevMessages) =>
                    prevMessages.map((m) =>
                        m.id === aiMessage.id
                            ? {
                                ...m,
                                message: m.message + data.delta.content,
                                loaded: true,
                                step: data.steps,
                                table: data.table,
                                dataRequest: data.data,
                                type: data.type,
                            }
                            : m
                    )
                );
            }
        }
    };

    const readStream = async () => {
        if (!reader) return;

        try {
            const { done, value } = await reader.read();
            if (done) return;

            const textChunk = textDecoder.decode(value);
            const newMessages = (messageBuffer + textChunk).split("\n");
            messageBuffer = newMessages.pop() || "";

            newMessages.forEach(processMessage);
            await readStream();
        } catch (error) {
            console.error("Error reading stream:", error);
        }
    };

    await readStream();
    // setCanSendMessage(true);
}

/**
 * Przewija do dolnej części okna czatu
 */
const scrollToBottom = function(){
    let elementId = 'chatBox';

    setTimeout(() => {
        // @ts-ignore
        document.getElementById(elementId).scrollTo({
            // @ts-ignore
            top: document.getElementById(elementId).scrollHeight,
            behavior: 'smooth',
        });
    }, 100);
};
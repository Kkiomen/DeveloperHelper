import React from 'react';
import AssistantMessage from "./AssistantMessage.tsx";
import Message from "../dto/Message.tsx";

interface MessagesProps {
    messages: Message[];
}
const AssistantMessages: React.FC<MessagesProps> = ({messages}) => {

    return <div>
        {messages.map((message, indexKey) => (
            <AssistantMessage message={message} key={indexKey} />
        ))}
    </div>;
};

export default AssistantMessages;

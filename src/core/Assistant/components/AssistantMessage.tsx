import React from 'react';
import Message from "../dto/Message.tsx";
// import remarkGfm from "remark-gfm";
// import rehypeHighlight from "rehype-highlight";
// import rehypePrism from "rehype-prism";
// import rehypeRaw from "rehype-raw";
// import ReactMarkdown from "react-markdown";
import Markdown from "../Helpers/Markdown.tsx";
import '../../../index.css';

interface MessageProps {
    message: Message;
    indexKey: number;
}


const AssistantMessage: React.FC<MessageProps> = ({message, indexKey}) => {
    const messageClass = message.type === 'user'
        ? 'assistant_user_bg'
        : 'assistant_bg';

    return <div>
        <div key={indexKey} className={`flex gap-3 text-gray-600 ${messageClass} text-sm flex-1 p-5`}>
            <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                <div className="rounded-full select-none">
                    <img src={message.imageUrl} alt="" className="w-full h-full rounded-full object-cover"/>
                </div>
            </span>
            <div className="leading-relaxed overflow-x-auto">
                { message.type == "assistant" ? (<span className="block font-bold text-gray-500 select-none">{message.name} </span>) : '' }
                <div className="text-gray-300">
                    {/*<ReactMarkdown*/}
                    {/*    remarkPlugins={[remarkGfm]}*/}
                    {/*    rehypePlugins={[rehypeHighlight, rehypePrism, rehypeRaw]}*/}
                    {/*    children={message.loaded ? message.message : '<div className="ml-8 dot-flashing text-white"/>'}*/}
                    {/*/>*/}

                    <Markdown content={message.message} />

                </div>
            </div>
        </div>
    </div>;
};

export default AssistantMessage;

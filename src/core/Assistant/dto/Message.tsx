class Message {
    id: number;
    name: string;
    type: string;
    imageUrl: string;
    message: string;
    loaded: boolean;

    constructor(id: number,name: string, type: string, imageUrl: string, message: string, loaded: boolean) {
        this.name = name;
        this.type = type;
        this.imageUrl = imageUrl;
        this.message = message;
        this.loaded = loaded;
        this.id = id;
    }
}

export default Message;
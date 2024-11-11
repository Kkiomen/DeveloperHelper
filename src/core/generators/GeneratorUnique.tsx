import Message from "../Assistant/dto/Message.tsx";

export const generateUniqueId = (messages: Message[]): number => {
  let randomId: number;
  do {
    // Generowanie losowego ID jako liczby całkowitej
    randomId = Math.floor(Math.random() * 1000000);
  } while (messages.some((message) => message.id === randomId)); // Sprawdzenie, czy ID już istnieje

  return randomId;
};
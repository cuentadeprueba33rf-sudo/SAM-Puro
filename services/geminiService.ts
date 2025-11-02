import { GoogleGenAI, Modality } from "@google/genai";
import type { Attachment, ChatMessage, ModeID } from '../types';
import { MessageAuthor } from '../types';

// Clave de API proporcionada por el usuario para un propósito específico.
const API_KEY = "AIzaSyDB-CXyCAp6CrquNDM7uMq_SoKDITRA9zI";

const fileToGenerativePart = async (attachment: Attachment) => {
    return {
        inlineData: {
            data: attachment.data.split(',')[1], // remove base64 prefix
            mimeType: attachment.type,
        },
    };
};

export const generateImage = async ({
    prompt,
    attachment,
}: {
    prompt: string;
    attachment?: Attachment;
}): Promise<Attachment> => {
    console.warn("La generación de imágenes está actualmente desactivada para entrenamiento.");
    throw new Error("La IA no puede generar imágenes ahora, está en entrenamiento. Vuelve a intentarlo más tarde.");
};


interface StreamGenerateContentParams {
    prompt: string;
    systemInstruction: string;
    attachment?: Attachment;
    history: ChatMessage[];
    mode: ModeID;
    modelName: string;
    onUpdate: (chunk: string) => void;
    onComplete: (fullText: string, groundingChunks?: any[]) => void;
    onError: (error: Error) => void;
    abortSignal: AbortSignal;
    latLng?: { latitude: number; longitude: number; };
}

export const streamGenerateContent = async ({
    prompt,
    systemInstruction,
    attachment,
    history,
    mode,
    modelName,
    onUpdate,
    onComplete,
    onError,
    abortSignal,
    latLng,
}: StreamGenerateContentParams) => {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    try {
        const contents = await Promise.all(history
            .filter(msg => msg.author === MessageAuthor.USER || msg.author === MessageAuthor.SAM)
            .map(async (msg) => {
                const parts: any[] = [{ text: msg.text }];
                if (msg.attachment) {
                    const filePart = await fileToGenerativePart(msg.attachment);
                    parts.unshift(filePart);
                }
                return {
                    role: msg.author === MessageAuthor.USER ? 'user' : 'model',
                    parts: parts,
                };
            }));
        
        const currentUserParts: any[] = [{ text: prompt }];
        if (attachment) {
            const imagePart = await fileToGenerativePart(attachment);
            currentUserParts.unshift(imagePart);
        }
        contents.push({ role: 'user', parts: currentUserParts });

        const config: any = {
            systemInstruction: systemInstruction,
        };

        if (mode === 'search') {
            config.tools = [{googleSearch: {}}];
        }

        if (mode === 'maps') {
            config.tools = [{googleMaps: {}}, {googleSearch: {}}];
            if (latLng) {
                config.toolConfig = {
                    retrievalConfig: { latLng }
                };
            }
        }

        const resultStream = await ai.models.generateContentStream({
            model: modelName,
            contents: contents,
            config,
        });

        if (abortSignal.aborted) return;
        
        let fullText = "";
        const rawGroundingChunks: any[] = [];
        
        for await (const chunk of resultStream) {
            if (abortSignal.aborted) {
                console.log("Stream reading aborted.");
                return;
            }
            
            const chunkText = chunk.text;
            if(chunkText) {
                fullText += chunkText;
                onUpdate(chunkText);
            }
            if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                rawGroundingChunks.push(...chunk.candidates[0].groundingMetadata.groundingChunks);
            }
        }
        
        if (!abortSignal.aborted) {
            const sanitizedGroundingChunks = rawGroundingChunks
                .map(chunk => {
                    if (chunk.web) {
                        return { web: { uri: chunk.web.uri, title: chunk.web.title } };
                    }
                    if (chunk.maps) {
                        return { maps: { uri: chunk.maps.uri, title: chunk.maps.title } };
                    }
                    return null;
                })
                .filter(Boolean); // remove nulls

            onComplete(fullText, sanitizedGroundingChunks.length > 0 ? sanitizedGroundingChunks : undefined);
        }

    } catch (error) {
        console.error("Error generating content:", error);
        if (error instanceof Error && error.name !== 'AbortError' && !abortSignal.aborted) {
            const customError = new Error("Error de conexión. Por favor, revisa tu conexión a internet e inténtalo de nuevo.");
            onError(customError);
        }
    }
};
import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { findChatMessagesByUserId, createChatMessage, deleteChatMessagesByUserId } from "./queries/chatMessages";
import { env } from "./lib/env";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are TransferAI, an expert UK property conveyancing assistant built into Transfer.app. You help property buyers, sellers, and conveyancers navigate the UK property transaction process.

Your expertise includes UK property law, conveyancing procedures, Stamp Duty calculations, leasehold vs freehold, property searches, mortgage guidance, exchange and completion processes, and post-completion requirements.

Always provide accurate UK property information. Be concise but thorough. Remind users your guidance doesn't replace professional legal advice.`;

async function callAnthropic(apiKey: string, messages: Array<{ role: string; content: string }>) {
  if (!apiKey) {
    throw new Error("Anthropic API key not configured");
  }

  console.log(`[AI] Calling Anthropic with ${messages.length} messages`);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AI] Anthropic error ${response.status}: ${errorText}`);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as any;
  const text = data.content?.[0]?.text || "I'm sorry, I couldn't process your request.";
  console.log(`[AI] Response received: ${text.substring(0, 100)}...`);
  return text;
}

export const aiRouter = createRouter({
  chat: authedQuery.input(z.object({ message: z.string().min(1), transactionId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        console.log(`[AI] Chat from user ${ctx.user.id}: ${input.message.substring(0, 50)}`);

        // Save user message
        await createChatMessage({ userId: ctx.user.id, role: "user", content: input.message, transactionId: input.transactionId });

        // Get history
        const history = await findChatMessagesByUserId(ctx.user.id, 20);
        const messages = history.map((h) => ({ role: h.role, content: h.content }));

        // Check if AI is configured
        if (!env.anthropicApiKey) {
          console.error("[AI] ANTHROPIC_API_KEY not set");
          const fallback = "I'm sorry, the AI service is not configured. Please ask your administrator to set the ANTHROPIC_API_KEY environment variable.";
          await createChatMessage({ userId: ctx.user.id, role: "assistant", content: fallback, transactionId: input.transactionId });
          return { response: fallback };
        }

        // Call Anthropic
        const response = await callAnthropic(env.anthropicApiKey, messages);

        // Save assistant response
        await createChatMessage({ userId: ctx.user.id, role: "assistant", content: response, transactionId: input.transactionId });
        return { response };
      } catch (err: any) {
        console.error("[AI] Chat error:", err);
        const errorMsg = `Sorry, I encountered an error: ${err.message || "Unknown error"}`;
        return { response: errorMsg };
      }
    }),

  history: authedQuery.input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => findChatMessagesByUserId(ctx.user.id, input?.limit || 50)),

  clear: authedQuery.mutation(async ({ ctx }) => {
    await deleteChatMessagesByUserId(ctx.user.id);
    return { success: true };
  }),
});

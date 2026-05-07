import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { findChatMessagesByUserId, createChatMessage, deleteChatMessagesByUserId } from "./queries/chatMessages";
import { env } from "./lib/env";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are TransferAI, an expert UK property conveyancing assistant built into Transfer.app. You help property buyers, sellers, and conveyancers navigate the UK property transaction process.

Your expertise includes UK property law, conveyancing procedures, Stamp Duty calculations, leasehold vs freehold, property searches, mortgage guidance, exchange and completion processes, and post-completion requirements.

Always provide accurate UK property information. Be concise but thorough. Remind users your guidance doesn't replace professional legal advice.`;

async function callAnthropic(apiKey: string, messages: Array<{ role: string; content: string }>) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await response.json() as any;
  return data.content?.[0]?.text || "I'm sorry, I couldn't process your request.";
}

export const aiRouter = createRouter({
  chat: authedQuery.input(z.object({ message: z.string().min(1), transactionId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      await createChatMessage({ userId: ctx.user.id, role: "user", content: input.message, transactionId: input.transactionId });

      const history = await findChatMessagesByUserId(ctx.user.id, 20);
      const messages = history.map((h) => ({ role: h.role, content: h.content }));

      const response = await callAnthropic(env.anthropicApiKey || "", messages);

      await createChatMessage({ userId: ctx.user.id, role: "assistant", content: response, transactionId: input.transactionId });
      return { response };
    }),

  history: authedQuery.input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => findChatMessagesByUserId(ctx.user.id, input?.limit || 50)),

  clear: authedQuery.mutation(async ({ ctx }) => {
    await deleteChatMessagesByUserId(ctx.user.id);
    return { success: true };
  }),
});

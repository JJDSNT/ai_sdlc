// apps/web/features/definition/components/conversation-chat.tsx

"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

// CopilotPanel (components/copilot/copilot-panel.tsx) não é reaproveitado
// aqui de propósito (ISSUE-0012): seus useFrontendTool são sobre gestão de
// Tasks (createChatTask/selectTask/etc.), um conceito que não existe nesta
// página — /definition é uma conversa única sobre uma Spec, não um console
// de tasks. Render direto de CopilotChat, sem tools customizadas.
export function ConversationChat() {
  return (
    <CopilotChat
      labels={{
        chatInputPlaceholder:
          "Descreva o problema, objetivo, restrição ou cenário que a IA deve entender...",
        welcomeMessageText:
          "Vamos começar pelo entendimento do problema. Qual experiência você quer habilitar e quais limites esse sistema precisa respeitar?",
      }}
    />
  );
}

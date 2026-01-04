// emails/yehoshua-reply-template.tsx
// Template for AI-generated confrontational responses

import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface YehoshuaReplyEmailProps {
  replyMessage: string;
  moment: "morning" | "midday" | "evening";
  memoryCount?: number;
}

export const YehoshuaReplyEmail = ({
  replyMessage = "C'est noté.",
  moment = "midday",
  memoryCount = 0,
}: YehoshuaReplyEmailProps) => {
  const previewText = replyMessage.substring(0, 100);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with moment indicator */}
          <Text style={header}>
            Yehoshua Focus // {moment.toUpperCase()}
          </Text>

          <Hr style={divider} />

          {/* AI-Generated Confrontational Response */}
          <Section style={replySection}>
            <Text style={replyText}>
              &ldquo;{replyMessage}&rdquo;
            </Text>
          </Section>

          {/* Memory Counter (if applicable) */}
          {memoryCount > 0 && (
            <>
              <Hr style={dividerLight} />
              <Section style={memorySection}>
                <Text style={memoryText}>
                  Mémoire du jour : {memoryCount} réflexion{memoryCount > 1 ? "s" : ""}
                </Text>
              </Section>
            </>
          )}

          {/* Subtle Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              {moment === "morning" && "On verra ce soir."}
              {moment === "midday" && "Corrige maintenant."}
              {moment === "evening" && "Demain, fais mieux."}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default YehoshuaReplyEmail;

// Styles - Minimal, confrontational aesthetic
const main = {
  backgroundColor: "#ffffff",
  fontFamily: "'Georgia', 'Times New Roman', Times, serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
  color: "#1a1a1a",
};

const header = {
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  color: "#888",
  fontSize: "11px",
  marginBottom: "20px",
  marginTop: "0",
};

const divider = {
  borderTop: "1px solid #eee",
  margin: "20px 0",
};

const dividerLight = {
  borderTop: "1px solid #eee",
  margin: "40px 0 20px 0",
};

const replySection = {
  margin: "30px 0",
  paddingLeft: "20px",
  borderLeft: "3px solid #000",
};

const replyText = {
  fontSize: "18px",
  fontStyle: "italic",
  lineHeight: "1.6",
  margin: "0",
  color: "#1a1a1a",
};

const memorySection = {
  paddingTop: "20px",
};

const memoryText = {
  fontSize: "11px",
  color: "#999",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0",
};

const footer = {
  marginTop: "40px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "11px",
  color: "#bbb",
  fontStyle: "italic",
  margin: "0",
};
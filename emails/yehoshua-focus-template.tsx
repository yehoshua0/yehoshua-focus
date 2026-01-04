// emails/yehoshua-focus-template.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

interface YehoshuaFocusEmailProps {
  title: string;
  prompt: string;
  subtext: string;
  moment: "morning" | "midday" | "evening";
}

export const YehoshuaFocusEmail = ({
  title = "L'Intention",
  prompt = "Quelle est l'unique chose qui mérite ton attention aujourd'hui ?",
  subtext = "Définis ton critère de succès pour ce soir.",
  moment = "morning",
}: YehoshuaFocusEmailProps) => {
  const previewText = `${title} - ${prompt.substring(0, 50)}...`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Text style={header}>
            Yehoshua Focus
          </Text>

          {/* Title */}
          <Heading style={h1}>{title}</Heading>
          <Hr style={divider} />

          {/* Main Prompt - The Challenge */}
          <Section style={promptSection}>
            <Text style={promptText}>&ldquo;{prompt}&rdquo;</Text>
          </Section>

          {/* Subtext */}
          <Text style={subtextStyle}>{subtext}</Text>

          {/* Footer */}
          <Hr style={dividerLight} />
          <Section style={footer}>
            <Text style={footerText}>
              Réponds à cet email pour documenter ta clarté.
              <br />
              Décider réduit le bruit. Le focus suit.
            </Text>
          </Section>

          {/* Moment Badge (optional visual indicator) */}
          <Text style={badge}>
            {moment === "morning" && "☀️ Matin"}
            {moment === "midday" && "🎯 Midi"}
            {moment === "evening" && "🌙 Soir"}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default YehoshuaFocusEmail;

// Styles - Inline for maximum email client compatibility
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "'Georgia', 'Times New Roman', Times, serif",
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
  marginBottom: "30px",
  marginTop: "0",
};

const h1 = {
  fontWeight: "400",
  fontSize: "22px",
  margin: "0 0 10px 0",
  color: "#1a1a1a",
};

const divider = {
  borderTop: "1px solid #eee",
  margin: "10px 0 40px 0",
};

const dividerLight = {
  borderTop: "1px solid #eee",
  margin: "50px 0 20px 0",
};

const promptSection = {
  margin: "40px 0",
  paddingLeft: "20px",
  borderLeft: "3px solid #000",
};

const promptText = {
  fontSize: "18px",
  fontStyle: "italic",
  lineHeight: "1.6",
  margin: "0",
  color: "#1a1a1a",
};

const subtextStyle = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0",
};

const footer = {
  paddingTop: "20px",
};

const footerText = {
  fontSize: "12px",
  color: "#999",
  lineHeight: "1.6",
  margin: "0",
};

const badge = {
  fontSize: "11px",
  color: "#bbb",
  textAlign: "center" as const,
  marginTop: "30px",
};
/// <reference types="vite/client" />

interface LeadConnectorChatWidget {
  openWidget?: () => void;
  closeWidget?: () => void;
}

interface LeadConnector {
  chatWidget?: LeadConnectorChatWidget;
}

interface Window {
  leadConnector?: LeadConnector;
}

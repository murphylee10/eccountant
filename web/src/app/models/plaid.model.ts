interface PlaidCreateConfig {
  token: string;
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: (err: any, metadata: any) => void;
  onEvent: (eventName: string, metadata: any) => void;
}

export interface Plaid {
  create: (config: PlaidCreateConfig) => PlaidHandler;
}

interface PlaidHandler {
  open: () => void;
  exit: () => void;
  destroy: () => void;
}

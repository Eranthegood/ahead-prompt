import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface ProviderConfig {
  provider: 'openai' | 'claude';
  model: string;
}

interface ProviderSelectorProps {
  value: ProviderConfig;
  onChange: (config: ProviderConfig) => void;
}

const PROVIDER_MODELS = {
  openai: [
    { id: 'gpt-5-2025-08-07', name: 'GPT-5 (Flagship)' },
    { id: 'gpt-5-mini-2025-08-07', name: 'GPT-5 Mini (Fast)' },
    { id: 'gpt-5-nano-2025-08-07', name: 'GPT-5 Nano (Fastest)' },
    { id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1' },
    { id: 'o3-2025-04-16', name: 'O3 (Reasoning)' },
    { id: 'o4-mini-2025-04-16', name: 'O4 Mini (Fast Reasoning)' },
    { id: 'gpt-4o', name: 'GPT-4o (Legacy)' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Legacy)' },
  ],
  claude: [
    { id: 'claude-opus-4-1-20250805', name: 'Claude 4 Opus (Most Capable)' },
    { id: 'claude-sonnet-4-20250514', name: 'Claude 4 Sonnet (High Performance)' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Fastest)' },
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet (Extended)' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Previous)' },
  ]
};

export function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  const handleProviderChange = (provider: 'openai' | 'claude') => {
    const defaultModel = PROVIDER_MODELS[provider][0].id;
    onChange({ provider, model: defaultModel });
  };

  const handleModelChange = (model: string) => {
    onChange({ ...value, model });
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 space-y-2">
        <Label htmlFor="provider">Provider</Label>
        <Select value={value.provider} onValueChange={handleProviderChange}>
          <SelectTrigger id="provider">
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="claude">Claude (Anthropic)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-2">
        <Label htmlFor="model">Model</Label>
        <Select value={value.model} onValueChange={handleModelChange}>
          <SelectTrigger id="model">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {PROVIDER_MODELS[value.provider].map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
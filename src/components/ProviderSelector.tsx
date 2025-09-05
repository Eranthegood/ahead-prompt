import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import openaiLogo from "@/assets/openai-logo.svg";

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
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  ],
  claude: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude 4 Sonnet' },
    { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
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
            <div className="flex items-center gap-2">
              {value.provider === 'openai' && (
                <img 
                  src={openaiLogo} 
                  alt="OpenAI" 
                  className="w-4 h-4" 
                />
              )}
              <SelectValue placeholder="Select a provider" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">
              <div className="flex items-center gap-2">
                <img 
                  src={openaiLogo} 
                  alt="OpenAI" 
                  className="w-4 h-4" 
                />
                OpenAI
              </div>
            </SelectItem>
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
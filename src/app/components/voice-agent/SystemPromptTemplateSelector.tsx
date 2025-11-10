/**
 * SystemPromptTemplateSelector Component
 *
 * Allows users to select a system prompt template before connecting.
 * Automatically updates the input mode based on the template's recommendation.
 */

import type { SystemPromptTemplate } from "@/lib/system-prompt-templates";
import type { InputMode } from "@/types/voice-agent";

interface SystemPromptTemplateSelectorProps {
  templates: SystemPromptTemplate[];
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
  onInputModeChange?: (mode: InputMode) => void;
  disabled?: boolean;
}

export function SystemPromptTemplateSelector({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onInputModeChange,
  disabled = false,
}: SystemPromptTemplateSelectorProps) {
  const handleTemplateChange = (templateId: string) => {
    if (disabled) return;
    
    onTemplateSelect(templateId);
    
    // Find the selected template and update input mode if recommended
    const selectedTemplate = templates.find((t) => t.id === templateId);
    if (selectedTemplate && onInputModeChange) {
      onInputModeChange(selectedTemplate.recommendedInputMode);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
      {templates.map((template) => {
        const isSelected = template.id === selectedTemplateId;
        return (
          <button
            key={template.id}
            onClick={() => handleTemplateChange(template.id)}
            disabled={disabled}
            className={`text-center p-4 rounded-lg border transition-all duration-200 ${
              isSelected
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="font-medium text-sm">{template.name}</div>
          </button>
        );
      })}
    </div>
  );
}


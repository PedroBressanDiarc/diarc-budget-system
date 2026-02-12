import * as React from "react";
import { Input } from "./input";

export interface CEPInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

const CEPInput = React.forwardRef<HTMLInputElement, CEPInputProps>(
  ({ value = "", onChange, ...props }, ref) => {
    const formatCEP = (value: string) => {
      // Remove tudo que não é dígito
      const numbers = value.replace(/\D/g, "");
      
      // Aplica a máscara: XXXXX-XXX
      if (numbers.length <= 5) return numbers;
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCEP(e.target.value);
      onChange?.(formatted);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        maxLength={9} // XXXXX-XXX
        placeholder="00000-000"
      />
    );
  }
);

CEPInput.displayName = "CEPInput";

export { CEPInput };

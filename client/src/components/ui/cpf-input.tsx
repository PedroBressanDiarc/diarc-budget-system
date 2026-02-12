import * as React from "react";
import { Input } from "./input";

export interface CPFInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

const CPFInput = React.forwardRef<HTMLInputElement, CPFInputProps>(
  ({ value = "", onChange, ...props }, ref) => {
    const formatCPF = (value: string) => {
      // Remove tudo que não é dígito
      const numbers = value.replace(/\D/g, "");
      
      // Aplica a máscara: XXX.XXX.XXX-XX
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
      if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCPF(e.target.value);
      onChange?.(formatted);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        maxLength={14} // XXX.XXX.XXX-XX
        placeholder="000.000.000-00"
      />
    );
  }
);

CPFInput.displayName = "CPFInput";

export { CPFInput };

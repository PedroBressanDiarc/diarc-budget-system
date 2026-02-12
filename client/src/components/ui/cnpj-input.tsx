import * as React from "react";
import { Input } from "./input";

export interface CNPJInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
}

const CNPJInput = React.forwardRef<HTMLInputElement, CNPJInputProps>(
  ({ value = "", onChange, ...props }, ref) => {
    const formatCNPJ = (value: string) => {
      // Remove tudo que não é dígito
      const numbers = value.replace(/\D/g, "");
      
      // Aplica a máscara: XX.XXX.XXX/XXXX-XX
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
      if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCNPJ(e.target.value);
      onChange?.(formatted);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        maxLength={18} // XX.XXX.XXX/XXXX-XX
        placeholder="00.000.000/0000-00"
      />
    );
  }
);

CNPJInput.displayName = "CNPJInput";

export { CNPJInput };

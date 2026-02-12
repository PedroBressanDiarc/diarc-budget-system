import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface CPFInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  showValidation?: boolean;
}

const CPFInput = React.forwardRef<HTMLInputElement, CPFInputProps>(
  ({ value = "", onChange, showValidation = false, className, ...props }, ref) => {
    const validateCPF = (cpf: string): boolean => {
      const numbers = cpf.replace(/\D/g, "");
      
      if (numbers.length !== 11) return false;
      
      // Elimina CPFs inválidos conhecidos
      if (/^(\d)\1{10}$/.test(numbers)) return false;
      
      // Valida 1º dígito verificador
      let soma = 0;
      for (let i = 0; i < 9; i++) {
        soma += parseInt(numbers.charAt(i)) * (10 - i);
      }
      let resto = 11 - (soma % 11);
      let digito1 = resto >= 10 ? 0 : resto;
      
      if (digito1 !== parseInt(numbers.charAt(9))) return false;
      
      // Valida 2º dígito verificador
      soma = 0;
      for (let i = 0; i < 10; i++) {
        soma += parseInt(numbers.charAt(i)) * (11 - i);
      }
      resto = 11 - (soma % 11);
      let digito2 = resto >= 10 ? 0 : resto;
      
      return digito2 === parseInt(numbers.charAt(10));
    };

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

    const isValid = value.replace(/\D/g, "").length === 11 ? validateCPF(value) : null;

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        maxLength={14} // XXX.XXX.XXX-XX
        placeholder="000.000.000-00"
        className={cn(
          showValidation && isValid !== null && (
            isValid 
              ? "border-green-500 focus-visible:ring-green-500" 
              : "border-red-500 focus-visible:ring-red-500"
          ),
          className
        )}
      />
    );
  }
);

CPFInput.displayName = "CPFInput";

export { CPFInput };

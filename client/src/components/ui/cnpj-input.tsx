import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface CNPJInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  showValidation?: boolean;
}

const CNPJInput = React.forwardRef<HTMLInputElement, CNPJInputProps>(
  ({ value = "", onChange, showValidation = false, className, ...props }, ref) => {
    const validateCNPJ = (cnpj: string): boolean => {
      const numbers = cnpj.replace(/\D/g, "");
      
      if (numbers.length !== 14) return false;
      
      // Elimina CNPJs inválidos conhecidos
      if (/^(\d)\1{13}$/.test(numbers)) return false;
      
      // Valida DVs
      let tamanho = numbers.length - 2;
      let numeros = numbers.substring(0, tamanho);
      const digitos = numbers.substring(tamanho);
      let soma = 0;
      let pos = tamanho - 7;
      
      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      
      let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      if (resultado !== parseInt(digitos.charAt(0))) return false;
      
      tamanho = tamanho + 1;
      numeros = numbers.substring(0, tamanho);
      soma = 0;
      pos = tamanho - 7;
      
      for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      
      resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
      return resultado === parseInt(digitos.charAt(1));
    };

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

    const isValid = value.replace(/\D/g, "").length === 14 ? validateCNPJ(value) : null;

    return (
      <Input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        maxLength={18} // XX.XXX.XXX/XXXX-XX
        placeholder="00.000.000/0000-00"
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

CNPJInput.displayName = "CNPJInput";

export { CNPJInput };

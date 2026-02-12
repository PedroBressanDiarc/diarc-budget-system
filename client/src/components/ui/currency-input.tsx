import * as React from "react";
import { Input } from "./input";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number;
  onChange?: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value = 0, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      // Formatar valor inicial
      setDisplayValue(formatCurrency(value));
    }, [value]);

    const formatCurrency = (num: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(num);
    };

    const parseCurrency = (str: string): number => {
      // Remove tudo exceto dígitos
      const numbers = str.replace(/\D/g, "");
      // Converte para número (últimos 2 dígitos são centavos)
      return numbers ? parseInt(numbers, 10) / 100 : 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = parseCurrency(inputValue);
      const formatted = formatCurrency(numericValue);
      
      setDisplayValue(formatted);
      onChange?.(numericValue);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        placeholder="R$ 0,00"
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
